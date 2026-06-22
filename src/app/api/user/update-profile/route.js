import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Cafe from '../../models/Cafe';
import { getServerSession } from "next-auth/next";

export async function PUT(request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ownerName, phone, shopName, businessType, cscId } = body;

    // डेटाबेस में यूज़र को खोजें और अपडेट करें
    const updatedCafe = await Cafe.findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: {
          ownerName: ownerName || session.user.name,
          phone: phone,
          shopName: shopName,
          businessType: businessType || 'Cyber Cafe',
          cscId: cscId,
          isProfileComplete: true // इसे true करना ज़रूरी है ताकि मॉडल बार-बार न दिखे
        }
      },
      { new: true } // अपडेटेड डॉक्यूमेंट वापस पाने के लिए
    );

    if (!updatedCafe) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully!',
      profile: updatedCafe
    }, { status: 200 });

  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}