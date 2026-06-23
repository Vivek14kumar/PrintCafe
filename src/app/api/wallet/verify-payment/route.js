import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import Ledger from "../../models/Ledger"; 
import Cafe from "../../models/Cafe";     

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function POST(req) {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature, 
      planDetails,
      cafeId 
    } = await req.json();

    // 1. Verify Razorpay Signature
    const bodyText = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(bodyText.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, message: "Invalid signature!" }, { status: 400 });
    }

    // 2. Connect to MongoDB
    await connectDB();

    // 3. Cafe Check - Agar yahan fail ho raha hai, matlab cafeId frontend se galat aa raha hai
    if (!cafeId) {
       return NextResponse.json({ success: false, message: "cafeId missing from frontend!" }, { status: 400 });
    }

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return NextResponse.json({ success: false, message: "Cafe not found in Database" }, { status: 404 });
    }

    let amountForLedger = 0;
    let descriptionForLedger = "";

    // 4. Plan Logic & Cafe Update
    if (planDetails.id === 4) {
      // --- UNLIMITED PASS (₹499) ---
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); 

      cafe.walletType = 'unlimited';
      cafe.unlimitedExpiry = expiryDate;
      await cafe.save();
      
      amountForLedger = 499;
      descriptionForLedger = `Wallet Recharge: ₹499 Monthly Pass (Unlimited Credits)`;
      
    } else {
      // --- STANDARD CREDITS ---
      const creditsToAdd = Number(planDetails.credits);
      
      cafe.walletType = 'credit';
      // DHYAN DEIN: Main 'walletBalance' use kar raha hu (Aapke print deduction API ke hisaab se)
      cafe.walletBalance = (cafe.walletBalance || 0) + creditsToAdd;
      await cafe.save();
      
      amountForLedger = creditsToAdd; 
      descriptionForLedger = `Wallet Recharge: ${planDetails.name}`;
    }

    // 5. Ledger Entry Create Karein (Sirf ek baar)
    await Ledger.create({
      cafeId: cafe._id,
      transactionType: 'Credit',
      amount: amountForLedger,
      balanceAfter: cafe.walletBalance, // Current updated balance
      description: descriptionForLedger,
      referenceId: razorpay_payment_id,
      status: 'Success'
    });
    
    return NextResponse.json({ success: true, message: "Payment verified & ledger updated!" });

  } catch (error) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}