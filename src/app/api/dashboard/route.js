import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Cafe from '../models/Cafe';
import PrintJob from '../models/PrintJob';
import { getServerSession } from "next-auth/next";

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const cafe = await Cafe.findOne({ email: session.user.email });
    if (!cafe) {
      return NextResponse.json({ success: false, message: 'Cafe not found' }, { status: 404 });
    }

    // --- 1. पेंडिंग जॉब्स निकालें ---
    const printQueue = await PrintJob.find({ 
      cafeId: cafe._id,
      status: { $in: ['Pending', 'Paid'] }
    }).sort({ createdAt: -1 });

    // --- 2. 🌟 MAGIC FIX: India (IST) Timezone Calculation ---
    const now = new Date();
    
    // आज रात 12 बजे का समय (India Time के हिसाब से)
    const istDateString = now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' }); 
    const startOfToday = new Date(istDateString + ' 00:00:00 GMT+0530');

    // इस महीने की 1 तारीख का समय (India Time के हिसाब से)
    const istMonth = now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', month: 'numeric' });
    const istYear = now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric' });
    const startOfMonth = new Date(`${istMonth}/01/${istYear} 00:00:00 GMT+0530`);


    // --- 3. MongoDB Aggregation (Fastest Calculation) ---
    const earningsData = await PrintJob.aggregate([
      { 
        $match: { 
          cafeId: cafe._id, 
          status: 'Printed' // सिर्फ प्रिंट हो चुकी फाइल्स का पैसा गिनें
        } 
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$totalAmount" },
          todayEarnings: {
            $sum: { $cond: [{ $gte: ["$createdAt", startOfToday] }, "$totalAmount", 0] }
          },
          monthlyEarnings: {
            $sum: { $cond: [{ $gte: ["$createdAt", startOfMonth] }, "$totalAmount", 0] }
          }
        }
      }
    ]);

    // अगर कोई डेटा नहीं मिला (नया कैफे है), तो 0 सेट करें
    const stats = earningsData[0] || { totalEarnings: 0, todayEarnings: 0, monthlyEarnings: 0 };

    return NextResponse.json({ 
      success: true, 
      shopName: cafe.shopName,
      ownerName: cafe.ownerName,
      shopCode: cafe.shopCode,
      walletBalance: cafe.walletBalance || 0,
      walletType: cafe.walletType || 'credit',
      stats: stats,
      queue: printQueue
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}