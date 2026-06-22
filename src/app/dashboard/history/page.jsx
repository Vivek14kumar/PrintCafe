"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight, FileText, Smartphone, Banknote } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const limit = 10; // एक पेज पर 10 रिकॉर्ड

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHistory();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter, sortOrder, currentPage]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/history?page=${currentPage}&limit=${limit}&search=${searchTerm}&status=${statusFilter}&sort=${sortOrder}`);
      const data = await res.json();
      
      if (data.success) {
        const formattedHistory = data.history.map(job => {
          // स्मार्ट फ़ाइल नेम जनरेटर: अगर नाम नहीं है, तो URL से निकालें
          let displayName = job.fileName;
          if (!displayName && job.fileUrl) {
            displayName = decodeURIComponent(job.fileUrl.split('/').pop().split('?')[0]);
          } else if (!displayName) {
            displayName = `${job.docCategory} Print`;
          }

          return {
            id: job._id,
            fileName: displayName,
            category: job.docCategory,
            token: job.tokenNumber,
            customerName: job.customerName,
            pages: job.pageRange, // JSON में "28" है
            copies: job.copies || 1,
            type: job.printType, // "BW" या "Color"
            amount: job.totalAmount, // 140
            payment: job.paymentMethod, // "Cash" या "UPI"
            status: job.status, // "Rejected" या "Printed"
            date: job.createdAt
          };
        });
        
        setHistory(formattedHistory);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (setter, value) => {
      setter(value);
      setCurrentPage(1); 
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Print History</h2>
        <p className="text-gray-500 font-medium mt-1">Track all your completed and rejected print jobs.</p>
      </header>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by token, name or file..." 
            value={searchTerm}
            onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
            className="pl-11 w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700 bg-gray-50 focus:bg-white transition"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Filter className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <select 
              value={statusFilter} 
              onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
              className="pl-10 pr-8 w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium text-gray-700 bg-gray-50 focus:bg-white transition cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Printed">Printed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <button 
            onClick={() => handleFilterChange(setSortOrder, sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-xl p-3 hover:bg-white transition font-medium text-gray-700 whitespace-nowrap"
          >
            <ArrowUpDown className="h-4 w-4" /> {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {loading && history.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center">
                <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading records...</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="p-5 font-bold">Token & Customer</th>
                    <th className="p-5 font-bold">Print Details</th>
                    <th className="p-5 font-bold">Payment</th>
                    <th className="p-5 font-bold">Status</th>
                    <th className="p-5 font-bold text-right">Date</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {history.map((job) => (
                    <tr key={job.id} className="hover:bg-blue-50/30 transition">
                        {/* Token & Customer Info */}
                        <td className="p-5">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-gray-900 text-white text-xs font-black px-2 py-0.5 rounded">#{job.token}</span>
                                <span className="text-sm font-bold text-gray-900">{job.customerName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mt-1.5">
                                <FileText className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[180px]">{job.fileName}</span>
                            </div>
                        </td>

                        {/* Print Details */}
                        <td className="p-5">
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-800">{job.type} Print</span>
                                <span className="text-xs text-gray-500 font-medium mt-0.5">
                                    Pages: {job.pages} • Copies: {job.copies}
                                </span>
                            </div>
                        </td>

                        {/* Amount & Payment */}
                        <td className="p-5">
                            <div className="flex flex-col items-start gap-1">
                                <span className="text-lg font-black text-gray-900">₹{job.amount}</span>
                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${job.payment === 'UPI' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                    {job.payment === 'UPI' ? <Smartphone className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                                    {job.payment}
                                </span>
                            </div>
                        </td>

                        {/* Status */}
                        <td className="p-5">
                            {job.status === 'Printed' ? (
                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                                <CheckCircle className="w-4 h-4" /> Printed
                            </span>
                            ) : (
                            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                                <XCircle className="w-4 h-4" /> Rejected
                            </span>
                            )}
                        </td>

                        {/* Date */}
                        <td className="p-5 text-right">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-gray-800">
                                    {new Date(job.date).toLocaleDateString('en-GB')}
                                </span>
                                <span className="text-xs text-gray-500 font-medium mt-0.5">
                                    {new Date(job.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </td>
                    </tr>
                ))}
                
                {history.length === 0 && !loading && (
                    <tr>
                    <td colSpan="5" className="p-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                            <FileText className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="font-bold text-gray-800 text-lg">No records found</p>
                            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search.</p>
                        </div>
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        )}
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                <span className="text-sm text-gray-500 font-medium">
                    Showing Page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
                </span>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || loading}
                        className="p-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-100 disabled:opacity-50 transition shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || loading}
                        className="p-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-100 disabled:opacity-50 transition shadow-sm"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}