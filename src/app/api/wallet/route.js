import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Cafe from '../models/Cafe';
import Ledger from '../models/Ledger';
import { getServerSession } from "next-auth/next";

export async function GET(request) {
  try {
    await connectToDatabase();

    // URL से Pagination और Filter parameters निकालें
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;
    
    // 👇 Naye Filter, Sort, aur Search params 👇
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type') || 'All';
    const sort = url.searchParams.get('sort') || 'newest';

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

    // 3. --- DYNAMIC QUERY BUILDER ---
    let query = { cafeId: cafe._id };

    // A. Type Filter (Credit/Debit)
    if (type !== 'All') {
      query.transactionType = type;
    }

    // B. Search Logic (Description या Reference ID में खोजें)
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { referenceId: { $regex: search, $options: 'i' } }
      ];
    }

    // 4. --- DYNAMIC SORTING LOGIC ---
    let sortOptions = {};
    switch (sort) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'amount_high':
        sortOptions = { amount: -1 };
        break;
      case 'amount_low':
        sortOptions = { amount: 1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    // 5. कुल ट्रांज़ैक्शन की गिनती करें (Total Pages कैलकुलेट करने के लिए)
    const totalTransactions = await Ledger.countDocuments(query);
    const totalPages = Math.ceil(totalTransactions / limit) || 1; // Kam se kam 1 page toh rahe

    // 6. इस कैफे की Ledger एंट्रीज़ निकालें (Filter, Sort aur Pagination के साथ)
    const ledgerEntries = await Ledger.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // 7. डेटा को Frontend के हिसाब से फॉर्मेट करें
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