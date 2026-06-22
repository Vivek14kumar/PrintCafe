import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Cafe from '../models/Cafe';
import { getServerSession } from "next-auth/next";

export async function PUT(request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { upiId, bwRate, colorRate } = body;

    const updatedCafe = await Cafe.findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: {
          upiId: upiId,
          'settings.bwRate': Number(bwRate),
          'settings.colorRate': Number(colorRate)
        }
      },
      { new: true }
    );

    if (!updatedCafe) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Settings and Print Rates saved successfully!'
    }, { status: 200 });

  } catch (error) {
    console.error("Settings Update Error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}