import React from 'react';
import Link from 'next/link';
import { 
  Printer, History, Wallet, User, Settings, LogOut, 
  Clock, ShieldCheck, Wallet as WalletIcon, Smartphone,
  CheckCircle2, XCircle, Printer as PrintIcon, MessageCircle
} from 'lucide-react';

// ==========================================
// 1. UPDATED DASHBOARD MOCKUP (Actual App UI)
// ==========================================
export const DashboardMockup = () => {
  return (
    <div className="w-full h-[600px] bg-[#F8FAFC] flex text-left font-sans overflow-hidden rounded-t-2xl shadow-inner border-t border-x border-slate-200">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo */}
          <div className="p-5 flex items-center gap-2">
            <Printer className="w-7 h-7 text-blue-600" />
            <div className="leading-tight">
              <span className="font-black text-xl text-blue-600 tracking-tight">PrintCafe</span>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Partner Portal</p>
            </div>
          </div>

          {/* Shop Info Card */}
          <div className="mx-4 mb-6 bg-slate-50 border border-slate-100 rounded-xl p-3 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span className="bg-blue-100 text-blue-600 p-1 rounded"><Smartphone className="w-3 h-3" /></span>
                Shop Code
              </div>
              <span className="text-blue-600 font-black text-xs">T9EBML</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm truncate">Digital Cyber Cafe</h3>
            <p className="text-xs text-slate-500 capitalize">Owner Name</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 px-3">
            <div className="flex items-center justify-between bg-blue-600 text-white px-4 py-3 rounded-xl font-medium text-sm shadow-md shadow-blue-600/20">
              <div className="flex items-center gap-3"><Clock className="w-4 h-4" /> Live Queue</div>
              <span className="text-xs">&gt;</span>
            </div>
            {[
              { icon: History, label: 'Print History' },
              { icon: Wallet, label: 'Wallet & Passbook' },
              { icon: User, label: 'My Profile' },
              { icon: Settings, label: 'Settings' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 px-4 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer">
                <item.icon className="w-4 h-4" /> {item.label}
              </div>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4">
          <div className="flex items-center justify-center gap-2 text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer border border-rose-100">
            <LogOut className="w-4 h-4" /> Logout Session
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium">Manage print queue and verify payments securely.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Today's Income</p>
            <h2 className="text-3xl font-black text-emerald-500">₹215.00</h2>
            <TrendingUpBg />
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">This Month</p>
            <h2 className="text-3xl font-black text-blue-600">₹2,335.00</h2>
            <TrendingUpBg />
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lifetime Income</p>
            <h2 className="text-3xl font-black text-slate-900">₹10,340.00</h2>
            <TrendingUpBg />
          </div>
          <div className="bg-[#161B2A] p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
             <div>
               <div className="flex items-center gap-2 mb-2">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wallet Balance</p>
                 <span className="bg-slate-700 text-slate-300 text-[9px] px-1.5 py-0.5 rounded font-bold">CREDIT</span>
               </div>
               <div className="flex justify-between items-start">
                 <h2 className="text-3xl font-black text-white">21 Cr</h2>
                 <div className="bg-slate-800 p-2 rounded-lg border border-slate-700"><WalletIcon className="w-5 h-5 text-slate-300" /></div>
               </div>
             </div>
             <button className="w-full mt-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-lg border border-slate-700 transition flex justify-center items-center gap-1">
               <span className="text-lg leading-none mb-0.5">+</span> Recharge Now
             </button>
          </div>
        </div>

        {/* Live Queue Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Clock className="w-5 h-5 text-blue-600" /> Live Print Queue
            </div>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
              2 Pending
            </span>
          </div>

          {/* Table Column Names */}
          <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-slate-100 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <div>Document Info</div>
            <div>Print Settings</div>
            <div>Payment Status</div>
            <div className="text-right">Review & Action</div>
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-4 gap-4 px-6 py-4 items-center border-b border-slate-50 hover:bg-slate-50 transition">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded font-black">#5756</span>
                <span className="text-xs font-bold text-slate-600">Guest</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">Aadhar Card</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Color Print</p>
              <p className="text-xs text-slate-500 font-medium">Pages: 1 <br/> Copies: 1</p>
            </div>
            <div>
              <p className="font-black text-slate-900 text-base mb-1">₹10</p>
              <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100 text-[10px] font-bold uppercase">
                <Smartphone className="w-3 h-3" /> Check UPI
              </span>
            </div>
            <div className="flex justify-end gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/20">
                <PrintIcon className="w-3.5 h-3.5" /> Print
              </button>
              <button className="bg-white border border-rose-200 text-rose-500 p-2 rounded-lg hover:bg-rose-50">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded font-black">#6864</span>
                <span className="text-xs font-bold text-slate-600">Guest</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">Document</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">BW Print</p>
              <p className="text-xs text-slate-500 font-medium">Pages: 1 <br/> Copies: 1</p>
            </div>
            <div>
              <p className="font-black text-slate-900 text-base mb-1">₹5</p>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 text-[10px] font-bold uppercase">
                <WalletIcon className="w-3 h-3" /> Collect Cash
              </span>
            </div>
            <div className="flex justify-end gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/20">
                <PrintIcon className="w-3.5 h-3.5" /> Print
              </button>
              <button className="bg-white border border-rose-200 text-rose-500 p-2 rounded-lg hover:bg-rose-50">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// SVG Background Graphic for Stats Cards
const TrendingUpBg = () => (
  <svg className="absolute right-0 top-0 w-24 h-24 text-slate-100 -mr-4 -mt-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);


