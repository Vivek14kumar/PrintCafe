"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Printer, FileText, Wallet, QrCode, LogOut, History, User, Store, ShieldCheck, ChevronRight, Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const [shopName, setShopName] = useState("Loading...");
  const [ownerName, setOwnerName] = useState("...");
  const [shopCode, setshopCode] = useState("...");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // दुकान का नाम और डिटेल्स लाने के लिए
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/dashboard'); // आप इसे अपनी profile API से भी बदल सकते हैं
        const data = await res.json();
        
        if (data.success) {
          // अगर API में नाम नहीं है, तो Default "My Print Cafe" दिखाएं
          // Note: अगर shopName 'stats' के अंदर आ रहा है, तो data.stats.shopName लिखें 
          setshopCode(data.shopCode);
          setShopName(data.shopName || "My Print Cafe"); 
          
          // Session से मालिक का नाम
          setOwnerName(session?.user?.name || "Name");
        }
      } catch (error) {
        // Error को console में प्रिंट करें ताकि debugging में आसानी हो
        console.error("Error fetching shop details:", error); 
        
        // Error आने पर भी UI खराब न हो, इसलिए Default Values सेट करें
        setShopName("My Print Cafe");
        setOwnerName(session?.user?.name || "Admin"); 
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  // Premium Active Link Styling
  const getLinkClass = (path) => {
    const isActive = pathname === path;
    return `group flex items-center justify-between p-3.5 rounded-2xl font-semibold transition-all duration-300 ${
      isActive 
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 translate-x-1" 
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 hover:translate-x-1"
    }`;
  };

  const IconWrapper = ({ isActive, children }) => (
    <div className={`flex items-center justify-center p-2 rounded-xl transition-all ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-sm'}`}>
      {children}
    </div>
  );
  // 🌟 NAYA LOGIC: Agar URL studio ka hai, toh pura layout skip kar do
  if (pathname === '/dashboard/studio') {
    return <main className="w-full h-screen overflow-hidden">{children}</main>;
  }
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans">
      
      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="p-1 rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Image 
              src="/logo.png" 
              alt="PrintCafe Logo" 
              width={36} 
              height={36} 
              className="object-contain mix-blend-multiply rounded-md"
            />
          </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Print<span className='text-blue-600'>Cafe</span>
            </span>
          </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-gray-50 text-gray-600 rounded-lg border border-gray-200">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:flex w-full md:w-[280px] bg-white border-r border-gray-100 flex-col justify-between fixed md:sticky top-0 h-screen z-40 transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-y-auto`}>
        
        <div className="p-5">
          {/* Logo Section */}
          <div className="mb-8 hidden md:block">
            {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="p-1 rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Image 
              src="/logo.png" 
              alt="PrintCafe Logo" 
              width={36} 
              height={36} 
              className="object-contain mix-blend-multiply rounded-md"
            />
          </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Print<span className='text-blue-600'>Cafe</span>
            </span>
          </Link>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1 ml-10">Partner Portal</p>
          </div>

          {/* Shop ID Card (Premium UI Element) */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-4 rounded-2xl mb-8 shadow-sm relative overflow-hidden group hover:border-blue-200 transition">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity"><Store className="w-24 h-24 text-blue-600" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Store className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-black text-blue-600 uppercase tracking-widest"> <span className='text-[8px] text-gray-400'>Shop Code</span> {shopCode}</p>
                <ShieldCheck className="w-3.5 h-3.5 text-green-500 ml-auto" />
              </div>
              <h3 className="text-gray-900 font-extrabold text-lg truncate leading-tight mt-1">{shopName}</h3>
              <p className="text-gray-500 text-xs font-medium mt-1 truncate">{ownerName}</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-2">
            <Link href="/dashboard" className={getLinkClass('/dashboard')} onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center gap-3">
                <IconWrapper isActive={pathname === '/dashboard'}><FileText className="w-4 h-4" /></IconWrapper>
                Live Queue
              </div>
              {pathname === '/dashboard' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>
            
            <Link href="/dashboard/history" className={getLinkClass('/dashboard/history')} onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center gap-3">
                <IconWrapper isActive={pathname === '/dashboard/history'}><History className="w-4 h-4" /></IconWrapper>
                Print History
              </div>
              {pathname === '/dashboard/history' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>

            <Link href="/dashboard/wallet" className={getLinkClass('/dashboard/wallet')} onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center gap-3">
                <IconWrapper isActive={pathname === '/dashboard/wallet'}><Wallet className="w-4 h-4" /></IconWrapper>
                Wallet & Passbook
              </div>
              {pathname === '/dashboard/wallet' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>

            <Link href="/dashboard/profile" className={getLinkClass('/dashboard/profile')} onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center gap-3">
                <IconWrapper isActive={pathname === '/dashboard/profile'}><User className="w-4 h-4" /></IconWrapper>
                My Profile
              </div>
              {pathname === '/dashboard/profile' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>

            <Link href="/dashboard/settings" className={getLinkClass('/dashboard/settings')} onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center gap-3">
                <IconWrapper isActive={pathname === '/dashboard/settings'}><QrCode className="w-4 h-4" /></IconWrapper>
                QR Code Settings
              </div>
              {pathname === '/dashboard/settings' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>
          </nav>
        </div>
        
        {/* Logout Section */}
        <div className="p-5 pb-8">
          <div className="bg-red-50 rounded-2xl p-2 border border-red-100">
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })} 
              className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-100 p-3 rounded-xl font-bold transition-all duration-200"
            >
              <LogOut className="w-5 h-5" /> Logout Session
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto w-full h-[calc(100vh-70px)] md:h-screen relative">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}