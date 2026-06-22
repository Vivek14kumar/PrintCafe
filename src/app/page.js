"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Printer, Zap, ShieldCheck, IndianRupee, ArrowRight, Star, Crown, Gift, 
  CheckCircle2, TrendingUp, Clock, Smartphone, Menu, X, QrCode, PlayCircle,
  LayoutDashboard, FileText, Settings, Bell, CircleDashed, FileUp
} from 'lucide-react';
import { DashboardMockup } from '@/components/DashboardMockup';
import { FloatingSupport } from '@/components/FloatingSupport';


const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-[#0A0F1C]"> {/* Deep Premium Navy Background */}
      {/* Premium Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Trust Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-md text-emerald-400 font-bold text-xs uppercase tracking-widest mb-8 border border-slate-700/50 shadow-2xl">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          India's Smartest Print Queue System
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1]">
          End the <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">WhatsApp Web</span> Headache. <br />
          Automate Your Counter.
        </h1>
        
        <p className="mt-6 max-w-2xl text-lg md:text-xl text-slate-400 mx-auto mb-10 font-medium leading-relaxed">
          Customers scan your QR, upload files, and pay <span className="text-white font-bold border-b border-emerald-500">directly to your UPI</span>. Files auto-print and auto-delete. Zero manual work. Zero commission.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href="/register" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-900/50 hover:shadow-blue-600/40 hover:-translate-y-1 flex items-center justify-center gap-2 border border-blue-500/30">
            Start Free Trial <ArrowRight className="h-5 w-5" />
          </Link>
          <a href="#demo" className="w-full sm:w-auto bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 backdrop-blur-sm hover:-translate-y-0.5">
            <PlayCircle className="h-5 w-5 text-blue-400" /> Watch Demo
          </a>
        </div>

        {/* Real-world Social Proof */}
        <p className="mt-8 text-sm text-slate-500 font-medium">Trusted by CSCs and Cyber Cafes across India</p>

        {/* 🌟 NEW: 50 Free Credits Welcome Banner 🌟 */}
        <div className="max-w-4xl mx-auto mb-16 mt-4 bg-gradient-to-r from-rose-400 to-orange-400 rounded-3xl p-1 relative overflow-hidden shadow-2xl shadow-blue-900/20 group">
           {/* Moving gradient border effect */}
           <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-red-500 to-purple-500 opacity-20 group-hover:opacity-40 transition-opacity blur-xl"></div>
           
           <div className="bg-slate-900 rounded-[22px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between relative z-10 overflow-hidden">
             {/* Abstract Shapes */}
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-500/20 rounded-full blur-3xl"></div>
             
             <div className="flex items-center gap-6 mb-6 md:mb-0 z-10">
               <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30 rotate-3">
                 <Gift className="w-8 h-8 text-white" />
               </div>
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-500/30">Welcome Offer</span>
                 </div>
                 <h3 className="text-2xl md:text-3xl font-black text-white">Get 50 Free Credits</h3>
                 <p className="text-slate-400 font-medium text-sm md:text-base mt-1">Register today and process your first 50 customers absolutely free. No card required.</p>
               </div>
             </div>

             <Link href="/register" className="w-full md:w-auto bg-white text-slate-900 hover:bg-green-300 px-8 py-2 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg z-10 hover:-translate-y-1">
               Claim Free Credits <ArrowRight className="w-5 h-5" />
             </Link>
           </div>
        </div>

        {/* Dashboard Mockup Container - Glassmorphism */}
        <div className="mt-16 max-w-full mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-transparent to-transparent z-10 h-full pointer-events-none"></div>
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-t-3xl shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] p-2 sm:p-4 relative z-0 transition-transform duration-500 group-hover:scale-[1.01]">
             <div className="bg-slate-50 rounded-t-2xl aspect-[16/11] md:aspect-[16/9] w-full flex items-start justify-center overflow-hidden border border-slate-800">
               {/* आपका DashboardMockup यहाँ रहेगा */}
               <DashboardMockup />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  return (
    <section id="benefits" className="py-24 bg-slate-50 relative z-20 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Everything a modern cafe needs.</h2>
          <p className="text-xl text-slate-600 font-medium">Built to handle the rush hour at your counter effortlessly.</p>
        </div>
        
        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          
          {/* Box 1: Large (Span 2) */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-8 border border-slate-800 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
            <IndianRupee className="w-10 h-10 text-emerald-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">Direct UPI, Zero Commission</h3>
            <p className="text-slate-400 font-medium max-w-md text-lg">
              No wallets, no settlement delays. Customers pay directly to your personal GPay, PhonePe, or Paytm. You keep 100% of your earnings.
            </p>
          </div>

          {/* Box 2: Square */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="bg-rose-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Auto-Delete Privacy</h3>
            <p className="text-slate-600 text-sm font-medium">
              Sensitive docs like Aadhar & PAN are instantly deleted after printing. Build massive trust with your customers.
            </p>
          </div>

          {/* Box 3: Square */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Save 3+ Hours Daily</h3>
            <p className="text-slate-600 text-sm font-medium">
              Skip the process of saving numbers, downloading PDFs, and adjusting print settings. Let the system do it.
            </p>
          </div>

          {/* Box 4: Large (Span 2) */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute right-0 bottom-0 bg-slate-50 w-1/2 h-full rounded-tl-[100px] -z-10"></div>
            <TrendingUp className="w-10 h-10 text-blue-600 mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Handle Multiple Customers at Once</h3>
            <p className="text-slate-600 font-medium max-w-md text-lg">
              3 people waiting? No problem. They all scan, upload, and pay simultaneously from their own phones. Your printer just keeps printing.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50 border-y border-slate-200/60 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight text-slate-900">It's as Simple as 1-2-3</h2>
          <p className="text-xl text-slate-600 font-medium">Replace chaotic WhatsApp groups and USB drives with a seamless, automated flow.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-1 bg-gradient-to-r from-blue-200 via-indigo-200 to-blue-200 z-0 rounded-full"></div>

          {/* Step 1 */}
          <div className="relative z-10 bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-lg shadow-slate-200/50">
            <div className="bg-blue-600 text-white w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20 ring-8 ring-white">
              <QrCode className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900">1. Customer Scans</h3>
            <p className="text-slate-600 font-medium leading-relaxed">No more saving numbers. They scan the beautiful QR code placed on your desk.</p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-lg shadow-slate-200/50">
            <div className="bg-indigo-600 text-white w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20 ring-8 ring-white">
              <IndianRupee className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900">2. Uploads & Pays</h3>
            <p className="text-slate-600 font-medium leading-relaxed">They upload their document and pay exactly what you charge, directly to your UPI app.</p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-lg shadow-slate-200/50">
            <div className="bg-blue-600 text-white w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20 ring-8 ring-white">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900">3. Auto-Prints</h3>
            <p className="text-slate-600 font-medium leading-relaxed">Once payment is successful, the document is sent straight to your printer instantly.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const PricingSection = () => {
  // आपके 4 रिचार्ज प्लान्स
  const plans = [
    {
      id: "starter", name: "Starter Pack", badge: "MINI PACK", badgeColor: "bg-slate-200 text-slate-700",
      price: "49", credits: "49 Credits", calculation: "₹1.00 / print",
      icon: <Zap className="w-6 h-6 text-slate-400" />,
      features: ["Live Print Queue", "Direct UPI Payments", "Basic Email Support"],
      buttonStyle: "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200", highlight: false
    },
    {
      id: "smart", name: "Smart Pack", badge: null,
      price: "99", credits: "110 Credits", calculation: "₹0.90 / print (11 Extra)",
      icon: <Star className="w-6 h-6 text-blue-500" />,
      features: ["Live Print Queue", "Direct UPI Payments", "Standard Support"],
      buttonStyle: "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200", highlight: false
    },
    {
      id: "pro", name: "Pro Pack", badge: "MOST POPULAR", badgeColor: "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-pink-500/30",
      price: "199", credits: "250 Credits", calculation: "₹0.80 / print (Value Deal)",
      icon: <Crown className="w-6 h-6 text-yellow-400" />,
      features: ["Live Print Queue", "Direct UPI Payments", "Priority WhatsApp Support", "Auto-Delete Privacy"],
      buttonStyle: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/20 border-none", highlight: true
    },
    {
      id: "monthly", name: "Monthly Pass", badge: "BEST FOR HEAVY USE", badgeColor: "bg-blue-600 text-white shadow-lg shadow-blue-600/30",
      price: "499", credits: "Unlimited Prints", calculation: "30 Days Validity",
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      features: ["Unlimited Print Queue", "Direct UPI Payments", "Priority Support", "Connect Multiple Printers"],
      buttonStyle: "bg-slate-900 hover:bg-slate-800 text-white border-none shadow-lg", highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-50 relative z-20 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Simple & Transparent Pricing</h2>
          <p className="text-xl text-slate-600 font-medium">Recharge your wallet instantly. No hidden fees, 100% money goes to your UPI.</p>
        </div>

        {/* 🌟 NEW: 50 Free Credits Welcome Banner 🌟 */}
        <div className="max-w-4xl mx-auto mb-16 bg-gradient-to-r from-amber-600 via-red-400 to-yellow-500 rounded-3xl p-1 relative overflow-hidden shadow-2xl shadow-blue-900/20 group">
           {/* Moving gradient border effect */}
           <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 opacity-20 group-hover:opacity-40 transition-opacity blur-xl"></div>
           
           <div className="bg-slate-900 rounded-[22px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between relative z-10 overflow-hidden">
             {/* Abstract Shapes */}
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
             
             <div className="flex items-center gap-6 mb-6 md:mb-0 z-10">
               <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30 rotate-3">
                 <Gift className="w-8 h-8 text-white" />
               </div>
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-500/30">Welcome Offer</span>
                 </div>
                 <h3 className="text-2xl md:text-3xl font-black text-white">Get 50 Free Credits</h3>
                 <p className="text-slate-400 font-medium text-sm md:text-base mt-1">Register today and process your first 50 customers absolutely free. No card required.</p>
               </div>
             </div>

             <Link href="/register" className="w-full md:w-auto bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg z-10 hover:-translate-y-1">
               Claim Free Credits <ArrowRight className="w-5 h-5" />
             </Link>
           </div>
        </div>
        
        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative bg-white rounded-3xl p-6 md:p-8 transition-all duration-300 flex flex-col h-full ${plan.highlight ? 'border-2 border-blue-500 shadow-2xl shadow-blue-900/10 lg:-translate-y-4' : 'border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1'}`}>
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full w-40 text-center text-[10px] font-black uppercase tracking-widest ${plan.badgeColor}`}>
                  {plan.badge}
                </div>
              )}
              <div className="flex justify-between items-start mb-4 mt-2">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">{plan.calculation}</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">{plan.icon}</div>
              </div>
              <div className="mb-2 grid  border-b border-slate-100 ">
                <span className="text-5xl font-black text-slate-900 ">₹{plan.price}</span> 
                <span className="text-sm font-bold text-slate-500 mb-2">/ {plan.credits}</span>
              </div>
              {/*<ul className="space-y-4 mb-8 text-sm text-slate-600 font-medium flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className='flex items-start gap-3'>
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.highlight ? 'text-blue-500' : 'text-slate-400'}`}/> 
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>*/}
              <button className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-auto ${plan.buttonStyle}`}>
                Select Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-20 relative px-4 sm:px-6">
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl shadow-blue-600/30 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Ready to upgrade your Cyber Cafe?
          </h2>
          <p className="text-xl text-blue-100 mx-auto mb-10 font-medium max-w-2xl">
            Join hundreds of smart cafe owners across India who are saving time and making more money with PrintCafe.
          </p>
          <Link href="/register" className="bg-white hover:bg-slate-50 text-blue-700 px-10 py-5 rounded-full font-extrabold text-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-flex items-center gap-3">
            Create Your Free Account <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// --- MAIN PAGE EXPORT ---

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-200 selection:text-blue-900 scroll-smooth">
     
      <>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <CTASection />
        <FloatingSupport/>
      </>
      
    </div>
  );
}