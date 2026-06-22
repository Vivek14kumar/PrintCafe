import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongodb";
import Cafe from "../../models/Cafe";
import Ledger from "../../models/Ledger";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectToDatabase();
        const cafe = await Cafe.findOne({ email: credentials.email });
        if (!cafe || !cafe.password) throw new Error("Invalid credentials");
        
        const isPasswordMatch = await bcrypt.compare(credentials.password, cafe.password);
        if (!isPasswordMatch) throw new Error("Invalid password");
        
        return { id: cafe._id.toString(), name: cafe.ownerName, email: cafe.email, isComplete: cafe.isProfileComplete };
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // 1. जब भी कोई लॉगिन करेगा (Google या Email से), यह फंक्शन चलेगा
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        try {
          await connectToDatabase();
          
          // चेक करें कि क्या यह ईमेल पहले से डेटाबेस में है?
          let existingCafe = await Cafe.findOne({ email: user.email });
          

          // 6 अक्षरों का एक रैंडम और यूनीक कोड जनरेट करने का फंक्शन
              const generateShopCode = () => {
                return Math.random().toString(36).substring(2, 8).toUpperCase(); 
                // यह 'A4B9X2' जैसा कुछ बनाएगा
              };
              // ... आपकी API के अंदर जहाँ आप नया कैफे सेव करते हैं ...
              const newShopCode = generateShopCode();

          if (!existingCafe) {
            // अगर नया यूज़र है, तो उसे 'Incomplete Profile' के साथ सेव करें
            existingCafe = await Cafe.create({
              ownerName: user.name, // Google से मिला नाम
              email: user.email,    // Google से मिला ईमेल
              authProvider: 'google',
              shopCode: newShopCode,
              isProfileComplete: false, // क्योंकि अभी Shop Name और Phone नहीं पता
              walletBalance: 50,
              walletType: "credit",
              settings: { bwRate: 0, colorRate: 0 }
            });
            // 🌟 MAGIC FIX: Google Signup पर भी Ledger एंट्री बनाएँ 🌟
            await Ledger.create({
              cafeId: existingCafe._id, // यहाँ existingCafe का इस्तेमाल किया है
              transactionType: 'Credit', 
              amount: 50,
              balanceAfter: 50, // 👈 यह Validator Error को रोकेगा
              description: 'Welcome Bonus - 50 Free Credits', 
            });
            console.log("New Google User Created in DB:", user.email);
          } else {
            console.log("Existing Google User Logged In:", user.email);
          }
          
          // NextAuth को MongoDB की ID दे दें
          user.id = existingCafe._id.toString();
          user.isComplete = existingCafe.isProfileComplete;
          
          
          return true;
        } catch (error) {
          console.error("Error saving Google user:", error);
          return false; // एरर आने पर लॉगिन रोक दें
        }
      }
      
      return true; // Credentials लॉगिन के लिए
    },

    // 2. JWT टोकन में डेटा सेव करना
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.isComplete = user.isComplete;
      }
      // अगर प्रोफाइल अपडेट होती है, तो टोकन भी अपडेट करें
      if (trigger === "update" && session?.isComplete) {
        token.isComplete = session.isComplete;
      }
      return token;
    },

    // 3. Session में डेटा भेजना (ताकि फ्रंटएंड में useSession() से डेटा मिल सके)
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.isComplete = token.isComplete;
      }
      return session;
    }
  },
});

export { handler as GET, handler as POST };