import React from 'react';
import Link from 'next/link';
import { Printer, Mail, ShieldCheck, Heart } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#0A0F1C] border-t border-slate-800/60 pt-20 pb-8 relative overflow-hidden">
      {/* 🌟 Premium Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12 mb-16 relative z-10">
        
        {/* Brand Section */}
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-3 mb-6 group inline-flex">
            <div className="rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                        <Image 
                          src="/logo.jpg" 
                          alt="PrintCafe Logo" 
                          width={36} 
                          height={36} 
                          className="object-contain mix-blend-multiply rounded-md"
                        />
                      </div>
            <span className="font-black text-3xl text-white tracking-tight">Print<span className="text-blue-500">Cafe</span></span>
          </Link>
          
          <p className="max-w-md text-slate-400 font-medium leading-relaxed mb-8 text-lg">
            Building smart automation tools to empower Indian CSCs and Cyber Cafes. Simplify your operations, save time, and grow your income today.
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs font-bold bg-slate-800/50 text-slate-300 px-4 py-2 rounded-full border border-slate-700/50 backdrop-blur-sm">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Made in India
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-900/20 text-emerald-400 px-4 py-2 rounded-full border border-emerald-800/30 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4" /> 100% Secure UPI
            </span>
          </div>
        </div>
        
        {/* Product Links */}
        <div>
          <h4 className="text-white font-black mb-6 text-lg tracking-wide">Product</h4>
          <ul className="space-y-4 font-medium text-slate-400">
            {['Features', 'How it Works', 'Pricing'].map((item) => (
              <li key={item}>
                <a href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block">
                  {item}
                </a>
              </li>
            ))}
            <li>
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-bold transition-all duration-300 hover:translate-x-1 inline-block">
                Register Cafe &rarr;
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h4 className="text-white font-black mb-6 text-lg tracking-wide">Support</h4>
          <ul className="space-y-4 font-medium text-slate-400">
            {[
              { name: 'Terms of Service', path: '/terms' },
              { name: 'Privacy Policy', path: '/privacy' },
              { name: 'Refund Policy', path: '/refund' },
              { name: 'Disclaimer', path: '/disclaimer' },
              { name: 'Contact Us', path: '/contact' }
            ].map((link) => (
              <li key={link.name}>
                <Link href={link.path} className="hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center text-slate-500 font-medium text-sm gap-6 relative z-10">
        <p>© {new Date().getFullYear()} PrintCafe. All rights reserved.</p>
        
        {/* Developer Credit Link (Premium Look) */}
        <a 
          href="mailto:your-email@example.com" 
          className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-800/50 transition-all group border border-transparent hover:border-slate-700/50"
        >
          <span className="text-slate-500 group-hover:text-slate-400 transition-colors">Designed & Maintained by</span>
          <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 group-hover:from-blue-300 group-hover:to-indigo-300 tracking-wide">
            Vik-Techz
          </span>
          <Mail className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
        </a>
      </div>
    </footer>
  );
}