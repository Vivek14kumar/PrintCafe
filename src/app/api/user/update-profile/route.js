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
    
    // 1. Updated extraction: removed cscId, added new location fields
    const { ownerName, phone, shopName, businessType, state, district, pincode } = body;

    // 2. डेटाबेस में यूज़र को खोजें और अपडेट करें
    const updatedCafe = await Cafe.findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: {
          ownerName: ownerName || session.user.name,
          phone: phone,
          shopName: shopName,
          businessType: businessType || 'Cyber Cafe',
          state: state,          // 👈 नया फील्ड
          district: district,    // 👈 नया फील्ड
          pincode: pincode,      // 👈 नया फील्ड
          isProfileComplete: true // इसे true करना ज़रूरी है ताकि मॉडल बार-बार न दिखे
        }
      },
      { new: true, runValidators: true } // update के बाद नया डेटा वापस करेगा और schema rules चेक करेगा
    ).select('-password');

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

    // 3. Handle Duplicate Phone Number Error gracefully
    // अगर कोई ऐसा नंबर डालता है जो पहले से किसी और कैफे का है, तो ये एरर देगा
    if (error.code === 11000 && error.keyPattern && error.keyPattern.phone) {
       return NextResponse.json({ 
         success: false, 
         message: 'This phone number is already registered to another account.' 
       }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}