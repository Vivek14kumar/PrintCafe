"use client";
import React, { useState, useEffect } from 'react';
// 👇 Naye icons import kiye hain (Search)
import { Wallet, ArrowDownRight, ArrowUpRight, PlusCircle, Infinity, X, CheckCircle2, ShieldCheck, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useSession } from "next-auth/react";

export default function WalletPage() {
  const { data: session } = useSession(); 
  const cafeId = session?.user?.id || session?.user?._id;
  const [balance, setBalance] = useState(0);
  const [walletType, setWalletType] = useState('credit');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 👇 Naye Filter, Sort aur Search States 👇
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All'); // 'All', 'Credit', 'Debit'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'amount_high', 'amount_low'
  // 👇 NAYE DATE STATES 👇
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Recharge Modal State
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const plans = [
    { id: 1, name: "Starter Pack", price: 49, credits: 49, tag: "Mini", desc: "₹1.00 / print" },
    { id: 2, name: "Smart Pack", price: 99, credits: 110, tag: "", desc: "₹0.90 / print (11 Extra)" },
    { id: 3, name: "Pro Pack", price: 199, credits: 250, tag: "Most Popular", desc: "₹0.80 / print (Value Deal)" },
    { id: 4, name: "Monthly Pass", price: 499, credits: "Unlimited", tag: "Best for Heavy Use", desc: "30 Days Validity" }
  ];

  // Fetch paginated and filtered data
  const fetchWalletData = async (page = 1) => {
    setLoading(true);
    try {
      // API call mein filter parameters add kiye hain
      const queryParams = new URLSearchParams({
        page,
        limit: 5,
        search: searchTerm,
        type: filterType,
        sort: sortBy,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const res = await fetch(`/api/wallet?${queryParams}`);
      const data = await res.json();
      if (data.success) {
        setBalance(data.walletBalance);
        setWalletType(data.walletType);
        setTransactions(data.transactions);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      }
    } catch (error) {
      console.error("Error fetching wallet data", error);
    } finally {
      setLoading(false);
    }
  };

  // 👇 Debouncing effect: Type karne ke 500ms baad automatically fetch hoga 👇
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchWalletData(1); // Filter change hone par wapas page 1 par jayenge
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterType, sortBy, startDate, endDate]); // Jab bhi inme se kuch badlega, fetch trigger hoga

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!selectedPlan) return alert("Please select a plan first!");
    
    setProcessingPayment(true);
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setProcessingPayment(false);
      return;
    }

    try {
      const orderRes = await fetch('/api/wallet/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: selectedPlan.price, planId: selectedPlan.id, credits: selectedPlan.credits })
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert("Failed to create order. Please try again.");
        setProcessingPayment(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Print Cafe",
        description: `Wallet Recharge: ${selectedPlan.name}`,
        order_id: orderData.order.id, 
        
        prefill: {
          name: session?.user?.name || session?.user?.ownerName || "Cafe Owner", 
          email: session?.user?.email || "owner@cafe.com",
          contact: session?.user?.phone || ""
        },

        handler: async function (response) {
          const verifyRes = await fetch('/api/wallet/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planDetails: selectedPlan,
              cafeId: cafeId 
            })
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment Successful! Credits added to your wallet.");
            setShowRechargeModal(false);
            setSelectedPlan(null);
            fetchWalletData(1); 
          } else {
            alert("Payment verification failed!");
          }
        },
        theme: { color: "#2563EB" }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Wallet & Passbook</h2>
        <p className="text-gray-500 font-medium mt-1">Manage your portal credits and view transaction history.</p>
      </header>

      <div className={`rounded-3xl p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6 ${walletType === 'unlimited' ? 'bg-gradient-to-r from-gray-800 to-black' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`}>
        <div>
          <p className="font-bold mb-1 opacity-80 uppercase tracking-wider text-xs">Available Credits</p>
          <h1 className="text-5xl font-black flex items-center">
            {walletType === 'unlimited' ? (
              <><Infinity className="w-12 h-12 mr-2 text-indigo-400" /> Unlimited</>
            ) : (
              <>{balance}</>
            )}
          </h1>
          <p className="text-sm opacity-80 mt-2 font-medium">
            {walletType === 'unlimited' ? 'You have unlimited print access.' : '1 Credit = 1 Print Job'}
          </p>
        </div>
        
        {walletType !== 'unlimited' && (
          <button 
            onClick={() => setShowRechargeModal(true)}
            className="bg-white text-blue-700 hover:bg-blue-50 font-bold py-3.5 px-8 rounded-xl shadow-md transition flex items-center gap-2 text-lg transform hover:scale-105"
          >
            <PlusCircle className="w-6 h-6" /> Recharge Wallet
          </button>
        )}
      </div>

      {/* Ledger Table with Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50 grid justify-between items-center gap-4">
          <div className='flex gap-3'>
            <h3 className="font-extrabold text-gray-800 hidden sm:block whitespace-nowrap">Recent Transactions</h3>
          {/* Search Bar */}
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800"
              />
            </div>
          </div>
          {/* 👇 FILTER CONTROLS UI 👇 */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            

            {/* 👇 DATE FILTER UI 👇 */}
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                title="Start Date"
              />
              <span className="text-gray-400 text-sm font-medium">to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                title="End Date"
                min={startDate} // End date hamesha start date ke baad ki honi chahiye
              />
              {/* Clear Dates Button */}
              {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                  title="Clear Dates"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Type Filter */}
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Credit">Credits (+)</option>
              <option value="Debit">Debits (-)</option>
            </select>

            {/* Sort Dropdown */}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-5 font-bold">Transaction Details</th>
                <th className="p-5 font-bold">Date & Time</th>
                <th className="p-5 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                 <tr><td colSpan="3" className="p-10 text-center text-gray-500 font-medium">Loading transactions...</td></tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-10 text-center text-gray-500 font-medium">No transactions found matching your criteria.</td>
                </tr>
              ) : (
                transactions.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${txn.type === 'Credit' ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'}`}>
                          {txn.type === 'Credit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{txn.desc}</p>
                          <p className="text-xs text-gray-400 font-medium mt-0.5 tracking-wide">
                            {txn.id ? `TXN ID: ${txn.id}` : 'Platform Action'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-sm font-medium text-gray-500">{txn.date}</td>
                    <td className={`p-5 text-right font-black text-lg ${txn.type === 'Credit' ? 'text-green-500' : 'text-gray-800'}`}>
                      {txn.type === 'Credit' ? '+' : '-'} {txn.amount} Cr
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
            <button 
              onClick={() => fetchWalletData(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm font-medium text-gray-500">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => fetchWalletData(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* RECHARGE MODAL */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="font-black text-gray-900 text-2xl">Recharge Credits</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">Select a plan to add credits to your wallet instantly.</p>
              </div>
              <button onClick={() => {setShowRechargeModal(false); setSelectedPlan(null);}} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 bg-gray-50 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map((plan) => (
                  <div 
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative cursor-pointer p-5 rounded-2xl border-2 transition-all duration-200 ${
                      selectedPlan?.id === plan.id 
                        ? 'border-blue-600 bg-blue-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    {plan.tag && (
                      <span className={`absolute -top-3 right-4 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                        plan.tag === 'Most Popular' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm' : 
                        plan.tag === 'Mini' ? 'bg-gray-200 text-gray-700' : 'bg-blue-600 text-white'
                      }`}>
                        {plan.tag}
                      </span>
                    )}

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                        <p className="text-xs text-gray-500 font-medium mt-1">{plan.desc}</p>
                      </div>
                      <div className={`p-1 rounded-full ${selectedPlan?.id === plan.id ? 'text-blue-600' : 'text-gray-300'}`}>
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-gray-900">₹{plan.price}</span>
                      {plan.credits !== 'Unlimited' && <span className="text-sm text-gray-500 font-medium mb-1">/ {plan.credits} Credits</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                100% Secure Payments via UPI & Cards
              </div>
              
              <button 
                onClick={handlePayment}
                disabled={!selectedPlan}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {selectedPlan ? `Pay ₹${selectedPlan.price} Securely` : 'Select a Plan'}
                {selectedPlan && <ArrowUpRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}