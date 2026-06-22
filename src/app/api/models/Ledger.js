import mongoose from 'mongoose';

const ledgerSchema = new mongoose.Schema({
  // 1. कैफे लिंकिंग
  cafeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cafe', 
    required: true 
  },

  // 2. ट्रांजैक्शन का प्रकार (पैसा आया या गया)
  transactionType: { 
    type: String, 
    enum: ['Credit', 'Debit'], 
    required: true 
    // Credit = वॉलेट रिचार्ज
    // Debit = प्रिंट होने पर ₹1 कटना
  },

  // 3. अमाउंट की जानकारी
  amount: { 
    type: Number, 
    required: true,
    min: [0, 'Amount cannot be negative']
  },

  // 4. ट्रांजैक्शन के बाद का वॉलेट बैलेंस (ऑडिट के लिए सबसे महत्वपूर्ण)
  balanceAfter: { 
    type: Number, 
    required: true 
    // इससे ट्रैक रहता है कि इस ट्रांजैक्शन के तुरंत बाद यूज़र का बैलेंस कितना था
  },

  // 5. विवरण (Description)
  description: { 
    type: String, 
    required: true 
    // जैसे: "Printed Aadhar_Card.pdf" या "Wallet Recharge via UPI"
  },

  // 6. पेमेंट गेटवे / यूटीआर डिटेल्स (केवल रिचार्ज के लिए)
  referenceId: { 
    type: String, 
    // UPI UTR नंबर या Razorpay Payment ID सेव करने के लिए
  },

  // 7. ट्रांजैक्शन का स्टेटस
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed'],
    default: 'Success'
  }
}, { 
  timestamps: true // इससे 'createdAt' ही ट्रांजैक्शन की तारीख और समय बन जाएगा
});

export default mongoose.models.Ledger || mongoose.model('Ledger', ledgerSchema);