import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Cafe from '../../models/Cafe';
import { getServerSession } from "next-auth/next";

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // डेटाबेस से कैफे की जानकारी लाएं (पासवर्ड को छोड़कर)
    const cafe = await Cafe.findOne({ email: session.user.email }).select('-password');
    
    if (!cafe) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      profile: cafe 
    }, { status: 200 });

  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}