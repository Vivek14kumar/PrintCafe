export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Cafe from '../../models/Cafe'; 

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    // 1. Next.js के नए अपडेट्स के अनुसार params को await करना ज़रूरी हो सकता है
    const resolvedParams = await params;
    console.log(resolvedParams);
    // 2. फ़ोल्डर का नाम चाहे [id] हो या [cafeId], हम दोनों को पकड़ लेंगे!
    const targetId = resolvedParams.id || resolvedParams.cafeId;

    console.log("👉 API Hit! URL से यह ID मिली है:", targetId);

    if (!targetId) {
       console.log("❌ URL में कोई ID नहीं मिली!");
       return NextResponse.json({ success: false, message: 'ID is missing in URL' }, { status: 400 });
    }

    // 3. डेटाबेस में ढूँढें
    //const cafe = await Cafe.findById(targetId).select('shopName upiId settings phone');
    const cafe = await Cafe.findOne({ shopCode: targetId.toUpperCase() }).select('shopName upiId settings phone');
    if (!cafe) {
      console.log("❌ यह ID डेटाबेस में नहीं मिली!");
      return NextResponse.json({ success: false, message: 'Cafe not found.' }, { status: 404 });
    }

    console.log("✅ कैफे मिल गया:", cafe.shopName);
    return NextResponse.json({ success: true, cafe: cafe }, { status: 200 });

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}