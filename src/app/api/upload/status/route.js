import { NextResponse } from 'next/server';
// अपने डेटाबेस कनेक्शन और मॉडल का सही पाथ यहाँ डालें
import dbConnect from '@/lib/mongodb'; // उदाहरण के लिए
import PrintJob from '../../models/PrintJob'; // उदाहरण के लिए

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token number is missing' },
        { status: 400 }
      );
    }

    await dbConnect();

    // डेटाबेस से 'status' फील्ड मंगा रहे हैं
    const job = await PrintJob.findOne({ tokenNumber: token }).select('status').lean();

    // केस 1: अगर जॉब डेटाबेस में है ही नहीं (शायद डिलीट हो गई हो)
    if (!job) {
      return NextResponse.json({ 
        success: true, 
        isPrinted: true, 
        isRejected: false,
        message: 'Job not found (likely printed and cleared)'
      });
    }

    // केस 2: ❌ नया कोड: अगर जॉब 'Rejected' या 'Cancelled' है
    if (job.status === 'Rejected' || job.status === 'Cancelled') {
      return NextResponse.json({ 
        success: true, 
        isPrinted: false,
        isRejected: true, // फ्रंटएंड इसी फ्लैग को चेक करेगा
        message: 'Order rejected by shop owner'
      });
    }

    // केस 3: 🌟 अगर जॉब मौजूद है और प्रिंट हो चुकी है
    if (job.status === 'Printed' || job.status === 'Completed' || job.status === 'Approved') {
      return NextResponse.json({ 
        success: true, 
        isPrinted: true,
        isRejected: false,
        message: 'Printed and ready'
      });
    } else {
      // केस 4: अगर स्टेटस 'Pending' या कतार में है
      return NextResponse.json({ 
        success: true, 
        isPrinted: false,
        isRejected: false,
        message: 'Pending in queue'
      });
    }

  } catch (error) {
    console.error("Status Check Error:", error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong on the server' },
      { status: 500 }
    );
  }
}