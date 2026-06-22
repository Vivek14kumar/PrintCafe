import mongoose from 'mongoose';

const cafeSchema = new mongoose.Schema({
  // 1. Basic Identity (बेसिक पहचान)
  ownerName: { 
    type: String, 
    required: [true, 'Owner name is required'] 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true
  },
  
  // 2. Authentication (लॉगिन डिटेल्स)
  password: { 
    type: String, 
    // यह required नहीं है क्योंकि Google Login वाले यूज़र्स का पासवर्ड नहीं होगा
  },
  authProvider: { 
    type: String, 
    enum: ['credentials', 'google'], 
    default: 'credentials' 
  },

  // 3. Business Details (कैफे की जानकारी)
  shopName: { 
    type: String 
  },
  shopCode: { type: String, unique: true },
  phone: { 
    type: String, 
    unique: true, 
    sparse: true // Sparse इसलिए ताकि Google से आने पर अगर फोन नंबर खाली हो, तो Database Error न दे
  },
  businessType: { 
    type: String, 
    enum: ['Cyber Cafe', 'CSC (Common Service Centre)', 'Vasudha Kendra', 'Stationery & Print Shop'] 
  },
  cscId: { 
    type: String // Optional
  },

  // 4. Payment & Wallet (वॉलेट और यूपीआई)
  upiId: { 
    type: String,
    // यह शुरू में खाली हो सकता है, कैफे वाला बाद में सेटिंग्स से इसे ऐड करेगा
  },
  walletBalance: { 
    type: Number, 
    default: 50 
  },
  walletType: { type: String, default: 'credit' }, // 'credit' या 'unlimited'
  totalEarnings: { type: Number, default: 0 },     // 👈 यह लाइन आपकी कमाई सेव करेगी

  // 5. System Status (सिस्टम फ्लैग्स)
  isProfileComplete: { 
    type: Boolean, 
    default: false 
    // Google से आने वाले यूज़र के लिए यह 'false' रहेगा जब तक वह Modal में कैफे का नाम नहीं डालता
  },
  isActive: {
    type: Boolean,
    default: true
    // अगर कोई धोखाधड़ी करता है, तो एडमिन यहाँ से उसका अकाउंट सस्पेंड (false) कर सकता है
  },

  // 6. Print Settings (दुकान के रेट्स)
  settings: {
    bwRate: { type: Number, default: 5 },
    colorRate: { type: Number, default: 10 }
  }
}, { 
  timestamps: true // यह खुद-ब-खुद createdAt और updatedAt सेव करेगा
});

// Next.js हॉट-रीलोडिंग में एरर से बचने के लिए यह चेक ज़रूरी है
export default mongoose.models.Cafe || mongoose.model('Cafe', cafeSchema, 'cafes');