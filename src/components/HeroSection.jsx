"use client"; // एनीमेशन (useState, useEffect) के लिए यह ज़रूरी है
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';
 import { DashboardMockup } from './DashboardMockup'; // अगर आपका DashboardMockup अलग फाइल में है, तो इसे इम्पोर्ट करें

export const HeroSection = () => {
  // 🌟 वो तीनों लाइनें जो लूप में चलेंगी
  const rotatingPhrases = [
    "WhatsApp Web ka Jhanjhat Khatam.",
    "Stop the WhatsApp Web Headache.",
    "No More WhatsApp Web."
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // हर 3 सेकंड में टेक्स्ट बदलने का लॉजिक
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % rotatingPhrases.length);
    }, 3000); // 3000ms = 3 Seconds

    return () => clearInterval(interval);
  }, [rotatingPhrases.length]);

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
        
        {/* 🌟 Rotating Text Headline 🌟 */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1] min-h-[140px] sm:min-h-[160px] md:min-h-[180px]">
          <span 
            key={currentIndex} 
            className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 block animate-fade-in-up"
          >
            {rotatingPhrases[currentIndex]}
          </span>
          Make Your Counter Smart.
        </h1>
        
        {/* आसान भाषा वाला Paragraph */}
        <p className="max-w-2xl text-lg md:text-xl text-slate-400 mx-auto mb-10 font-medium leading-relaxed">
          Customer खुद QR स्कैन करेगा, फ़ाइल अपलोड करेगा और <span className="text-white font-bold border-b border-emerald-500">सीधा आपके UPI पर पैसे भेजेगा</span>। फ़ाइल अपने-आप प्रिंट और डिलीट हो जाएगी। आपका 100% टाइम बचेगा!
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