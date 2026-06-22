import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Cafe from '../../models/Cafe';
import PrintJob from '../../models/PrintJob';
import { getServerSession } from "next-auth/next";

export async function GET(request) {
  try {
    await connectToDatabase();
    
    // 1. Check Auth
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get Cafe
    const cafe = await Cafe.findOne({ email: session.user.email });
    if (!cafe) {
      return NextResponse.json({ success: false, message: 'Cafe not found' }, { status: 404 });
    }

    // 3. Extract Pagination & Filter parameters from the URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10; // Default: 10 items per page
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'All';
    const sortOrder = searchParams.get('sort') || 'newest';

    // 4. Build the MongoDB Query
    const query = { cafeId: cafe._id };
    
    if (status !== 'All') {
        query.status = status;
    }
    
    if (search) {
        query.$or = [
            { fileName: { $regex: search, $options: 'i' } }, // Case-insensitive search on file name
            { customerName: { $regex: search, $options: 'i' } } // Optional: also search by customer name
        ];
    }

    // 5. Calculate how many documents to skip
    const skipAmount = (page - 1) * limit;
    const sortOption = sortOrder === 'newest' ? { createdAt: -1 } : { createdAt: 1 };

    // 6. Run queries in parallel for performance (Count total & Fetch chunk)
    const [history, totalJobs] = await Promise.all([
        PrintJob.find(query)
            .sort(sortOption)
            .skip(skipAmount)
            .limit(limit),
        PrintJob.countDocuments(query)
    ]);

    return NextResponse.json({ 
      success: true, 
      history: history,
      pagination: {
          total: totalJobs,
          currentPage: page,
          totalPages: Math.ceil(totalJobs / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}