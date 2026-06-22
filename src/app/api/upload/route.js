import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { pusherServer } from '@/lib/pusher';
import PrintJob from '../models/PrintJob';
import { v2 as cloudinary } from 'cloudinary';
import Cafe from '../models/Cafe';

// 1. Cloudinary को कॉन्फ़िगर करें
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Cloudinary पर अपलोड करने का स्मार्ट फंक्शन (Dynamic Folders के साथ)
async function uploadToCloudinary(file) {
  if (!file || file === 'null') return null;
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(new Uint8Array(bytes));

  // वेबसाइट का मुख्य नाम
  const websiteFolder = "SmartPrintPortal"; 

  // फाइल के टाइप (Extension) के हिसाब से सब-फोल्डर तय करें
  // Optional chaining (?.) का उपयोग ताकि सर्वर क्रैश न हो
  const isPdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');
  const subFolder = isPdf ? 'PDFs' : 'Images';

  // पूरा पाथ बनाएँ (जैसे: SmartPrintPortal/PDFs या SmartPrintPortal/Images)
  const finalFolderPath = `${websiteFolder}/${subFolder}`;

  // फाइल के नाम से स्पेस हटाकर एक यूनीक नाम बनाना
  const originalName = file.name ? file.name.replace(/\s+/g, '_').split('.')[0] : 'file';
  const uniqueFileName = `${Date.now()}_${originalName}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: finalFolderPath, // यहाँ डायनामिक फोल्डर सेट हो रहा है
        public_id: uniqueFileName,
        resource_type: 'raw', 
      },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    uploadStream.end(buffer);
  });
}

// 3. Main POST API Route
// 3. Main POST API Route
export async function POST(request) {
  try {
    await connectToDatabase();
    const formData = await request.formData();
    
    const customerName = formData.get('customerName') || 'Guest';
    const tokenNumber = Math.floor(1000 + Math.random() * 9000).toString();

    // 🚨 यहाँ frontend 'T9EBML' भेज रहा है 🚨
    const shopCodeFromFrontend = formData.get('cafeId'); 
    
    // 👈 1. असली कैफे ढूँढें
    const cafe = await Cafe.findOne({ shopCode: shopCodeFromFrontend.toUpperCase() });
    
    if (!cafe) {
      return NextResponse.json({ success: false, message: 'Invalid Cafe Code' }, { status: 404 });
    }

    const docCategory = formData.get('docCategory'); 
    const printType = formData.get('printType');
    const copies = parseInt(formData.get('copies')) || 1;
    const paymentMethod = formData.get('paymentMethod'); 
    const totalPrice = parseFloat(formData.get('totalPrice')) || 0;
    const pageRange = formData.get('pageRange') || 'All';

    let fileUrl = null, frontFileUrl = null, backFileUrl = null;
    const isIdMode = ['Aadhar', 'PAN', 'Voter'].includes(docCategory);

    // फाइल्स को सीधे Cloudinary पर अपलोड करें
    if (isIdMode) {
      frontFileUrl = await uploadToCloudinary(formData.get('fileFront'));
      backFileUrl = await uploadToCloudinary(formData.get('fileBack'));
    } else {
      fileUrl = await uploadToCloudinary(formData.get('file'));
    }

    // 👈 2. Cloudinary के URLs को MongoDB में सेव करें, असली cafe._id के साथ
    const newJob = await PrintJob.create({
      cafeId: cafe._id, // 👈 यहाँ बदलाव किया गया है: cafe._id इस्तेमाल करें
      docCategory, fileUrl, frontFileUrl, backFileUrl,
      pageRange, copies, printType, totalAmount: totalPrice, paymentMethod,
      customerName, tokenNumber
    });

    // 🌟 3. PUSHER MAGIC: डैशबोर्ड को तुरंत (Real-time) सिग्नल भेजें! 🌟
    try {
      await pusherServer.trigger(
        `shop-${shopCodeFromFrontend.toUpperCase()}`, 
        'incoming-print', 
        {
          _id: newJob._id,
          tokenNumber: tokenNumber,        // 👈 FIX: टोकन नंबर जोड़ा गया
          docCategory: docCategory,
          customerName: customerName,
          totalAmount: totalPrice,
          copies: copies,
          printType: printType,            // 👈 FIX: प्रिंट टाइप जोड़ा गया
          pageRange: pageRange,            // 👈 FIX: पेज रेंज जोड़ा गया
          paymentMethod: paymentMethod,    // 👈 FIX: पेमेंट मेथड
          fileUrl: fileUrl,                // 👈 FIX: फाइल का लिंक (ताकि तुरंत प्रिंट हो सके)
          frontFileUrl: frontFileUrl,      // 👈 FIX: ID Card Front
          backFileUrl: backFileUrl,        // 👈 FIX: ID Card Back
          status: 'Pending',
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
      );
    } catch (pusherError) {
      console.error("Pusher Signal Error:", pusherError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Order sent securely to cloud!',
      jobId: newJob._id,
      tokenNumber: tokenNumber
    });

  } catch (error) {
    console.error("Cloud Upload Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to process.' }, { status: 500 });
  }
}