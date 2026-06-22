import mongoose from 'mongoose';

const printJobSchema = new mongoose.Schema({
  cafeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cafe', required: true },
  
  // --- नया: कस्टमर की पहचान के लिए ---
  customerName: { type: String, default: 'Guest' },
  tokenNumber: { type: String, required: true }, // 4-digit code (e.g., "4092")
  
  docCategory: { type: String, enum: ['Document', 'Aadhar', 'PAN', 'Voter'], default: 'Document' },
  fileName: { type: String },
  fileUrl: { type: String }, 
  frontFileUrl: { type: String }, 
  backFileUrl: { type: String }, 
  pageRange: { type: String, default: 'All' },
  copies: { type: Number, default: 1 },
  printType: { type: String, enum: ['BW', 'Color'], required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'Cash'], default: 'Cash' },
  status: { type: String, enum: ['Pending', 'Paid', 'Printed', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.models.PrintJob || mongoose.model('PrintJob', printJobSchema);