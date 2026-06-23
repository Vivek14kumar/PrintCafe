import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PrintJob from '../../models/PrintJob';
import Cafe from '../../models/Cafe'; // 👈 यह इम्पोर्ट करना बहुत ज़रूरी है
import Ledger from '../../models/Ledger';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// URL से Public ID निकालने और Cloudinary से डिलीट करने का फंक्शन
async function deleteFromCloudinary(url) {
  if (!url || typeof url !== 'string') return;
  
  try {
    const parts = url.split('/upload/');
    if (parts.length !== 2) {
      console.warn(`⚠️ Unrecognized Cloudinary URL format: ${url}`);
      return;
    }
    
    const pathWithoutVersion = parts[1].replace(/^v\d+\//, ''); 
    const dotIndex = pathWithoutVersion.lastIndexOf('.');
    let publicId = dotIndex !== -1 ? pathWithoutVersion.substring(0, dotIndex) : pathWithoutVersion;

    if (!publicId) return;

    // 🌟 THE FIX: URL को डिकोड करें ताकि %20, %281%29 जैसे सिंबल असली नाम (स्पेस, ब्रैकेट) में बदल जाएं
    publicId = decodeURIComponent(publicId);

    // 1. Try deleting assuming it's an 'image' (Cloudinary's default)
    let response = await cloudinary.uploader.destroy(publicId);
    
    // 2. If not found, it's likely uploaded as a 'raw' document. Try again.
    if (response.result === 'not found') {
      response = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }

    // 3. Log the ACTUAL result from Cloudinary
    if (response.result === 'ok') {
      console.log(`✅ Truly Deleted from Cloudinary: ${publicId}`);
    } else {
      console.log(`⚠️ Cloudinary failed to delete. Reason: ${response.result} | File: ${publicId}`);
    }
    
  } catch (err) {
    console.error(`❌ Cloudinary Delete Error:`, err);
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const { jobId, action } = await request.json();

    const job = await PrintJob.findById(jobId);
    if (!job) return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });

    // 👈 कैफे (CSC) ऑपरेटर का डेटा डेटाबेस से निकालें
    const cafe = await Cafe.findById(job.cafeId);
    if (!cafe) return NextResponse.json({ success: false, message: 'Cafe not found' }, { status: 404 });

    if (action === 'approve') {
      
      // 1. --- WALLET DEDUCTION LOGIC ---
      if (cafe.walletType !== 'unlimited') {
        const creditsToDeduct = 1; // अभी 1 प्रिंट रिक्वेस्ट = 1 क्रेडिट कट रहा है
        
        if (cafe.walletBalance < creditsToDeduct) {
          // अगर बैलेंस कम है, तो एरर भेजें और प्रिंट रोक दें
          return NextResponse.json({ success: false, message: 'Insufficient Wallet Credits. Please recharge!' }, { status: 400 });
        }
        cafe.walletBalance -= creditsToDeduct;

        //Ledger (Passbook) में एंट्री करें
        await Ledger.create({
          cafeId: cafe._id,
          transactionType: 'Debit',
          amount: creditsToDeduct,
          balanceAfter: cafe.walletBalance,
          description: `Printed ${job.docCategory} (Token: #${job.tokenNumber})`,
          status: 'Success'
        });
        
      }

      

      // 2. --- UPDATE CAFE EARNINGS ---
      // कैफे की कुल कमाई में इस प्रिंट जॉब के पैसे जोड़ें
      cafe.totalEarnings = (cafe.totalEarnings || 0) + (job.totalAmount || 0);
      await cafe.save();

      // 3. --- STATUS UPDATE ---
      job.status = 'Printed';
      await job.save();

      // Cloudinary से फाइलें डिलीट करें (Auto-Delete)
      await deleteFromCloudinary(job.fileUrl);
      await deleteFromCloudinary(job.frontFileUrl);
      await deleteFromCloudinary(job.backFileUrl);

      return NextResponse.json({ 
        success: true, 
        message: 'Printed, Earnings Updated & File Deleted!' 
      });
    } 
    
    if (action === 'reject') {
      job.status = 'Rejected';
      await job.save();

      // रिजेक्ट होने पर भी Cloudinary से फाइलें डिलीट करें
      await deleteFromCloudinary(job.fileUrl);
      await deleteFromCloudinary(job.frontFileUrl);
      await deleteFromCloudinary(job.backFileUrl);

      return NextResponse.json({ 
        success: true, 
        message: 'Rejected & File Deleted!' 
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid Action' }, { status: 400 });

  } catch (error) {
    console.error("Action API Error:", error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}