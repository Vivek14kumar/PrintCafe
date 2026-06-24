import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Cafe from '../../models/Cafe';
import Ledger from '../../models/Ledger';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { ownerName, phone, shopName, businessType, state, district, pincode, password, email } = body;

    // 1. डेटाबेस कनेक्ट करें
    await connectToDatabase();

    // 2. चेक करें कि क्या कैफे (फ़ोन या ईमेल) पहले से मौजूद है?
    const existingCafe = await Cafe.findOne({ 
      $or: [{ phone: phone }, { email: email }] 
    });

    if (existingCafe) {
      return NextResponse.json(
        { success: false, message: 'User with this Phone or Email already exists!' },
        { status: 400 }
      );
    }

    // 3. पासवर्ड को हैश (सुरक्षित) करें
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6 अक्षरों का एक रैंडम और यूनीक कोड जनरेट करने का फंक्शन
    const generateShopCode = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase(); 
    };
    
    const newShopCode = generateShopCode();

    // 4. 🌟 नया कैफे डेटाबेस में सेव करें (create सीधा सेव कर देता है)
    const newCafe = await Cafe.create({
      shopCode: newShopCode,
      ownerName,
      phone,
      email, 
      shopName,
      businessType,
      state,       // 👈 नया फील्ड 
      district,    // 👈 नया फील्ड
      pincode,     // 👈 नया फील्ड
      password: hashedPassword,
      walletBalance: 50, // 🌟 नया अकाउंट 50 बैलेंस से शुरू होगा
      walletType: "credit",
      isProfileComplete: true, 
      settings: {
        bwRate: 0,
        colorRate: 0
      }
    });

    // 5. 🌟 MAGIC FIX: पासबुक (Ledger) में Welcome Bonus की एंट्री करें
    await Ledger.create({
      cafeId: newCafe._id, // newCafe से सीधा ID ले ली
      transactionType: 'Credit', 
      amount: 50,
      balanceAfter: 50, // 👈 यह लाइन मिसिंग थी! (नया अकाउंट है तो बैलेंस 50 ही रहेगा)
      description: 'Welcome Bonus - 50 Free Credits', 
    });

    return NextResponse.json(
      { success: true, message: 'Partner Account Created Successfully!', cafeId: newCafe._id },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}