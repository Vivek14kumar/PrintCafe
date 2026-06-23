import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Cafe from '../models/Cafe';
import Ledger from '../models/Ledger';
import { getServerSession } from "next-auth/next";

export async function GET(request) {
  try {
    await connectToDatabase();

    // URL से Pagination parameters निकालें (default page=1, limit=5)
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;
    
    // 1. चेक करें कि कौन लॉगिन है
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // 2. कैफे निकालें
    const cafe = await Cafe.findOne({ email: session.user.email });
    if (!cafe) {
      return NextResponse.json({ success: false, message: 'Cafe not found' }, { status: 404 });
    }

    // 3. कुल ट्रांज़ैक्शन की गिनती करें (Total Pages कैलकुलेट करने के लिए)
    const totalTransactions = await Ledger.countDocuments({ cafeId: cafe._id });
    const totalPages = Math.ceil(totalTransactions / limit);

    // 4. इस कैफे की Ledger एंट्रीज़ निकालें (Pagination के साथ)
    const ledgerEntries = await Ledger.find({ cafeId: cafe._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 5. डेटा को Frontend के हिसाब से फॉर्मेट करें
    const formattedTransactions = ledgerEntries.map(entry => ({
      id: entry._id.toString().slice(-6).toUpperCase(), // ID के आखिरी 6 अक्षर
      type: entry.transactionType,
      amount: entry.amount,
      desc: entry.description,
      date: new Date(entry.createdAt).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit'
      })
    }));

    return NextResponse.json({ 
      success: true, 
      walletBalance: cafe.walletBalance || 0,
      walletType: cafe.walletType || 'credit',
      transactions: formattedTransactions,
      currentPage: page,       // Frontend pagination UI के लिए
      totalPages: totalPages   // Frontend pagination UI के लिए
    });

  } catch (error) {
    console.error("Wallet API Error:", error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}