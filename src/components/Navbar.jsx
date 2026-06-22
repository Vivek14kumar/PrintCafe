"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Printer, Menu, X } from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 🌟 Navigation Links (इसे अपडेट करना बहुत आसान है)
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How it Works', path: '/#how-it-works' },
    { name: 'Pricing', path: '/#pricing' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/50 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center h-14">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
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
          
          {/* Nav Links (Desktop) - Premium Pill Shape */}
          <div className="hidden md:flex space-x-1 items-center bg-slate-100/50 border border-slate-200 rounded-full px-2 py-1 shadow-sm">
            {navLinks.map((item) => (
              <Link 
                key={item.name} 
                href={item.path} 
                className="text-slate-600 hover:text-blue-600 hover:bg-white px-4 py-2 rounded-full transition-all font-semibold text-sm"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-slate-600 font-bold hover:text-blue-600 transition px-4 text-sm">
              Login
            </Link>
            <Link href="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 text-sm flex items-center gap-2">
              Register Cafe
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 hover:text-slate-900 focus:outline-none p-2 bg-slate-100 rounded-full border border-slate-200 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 pt-4 pb-8 space-y-4 shadow-2xl absolute w-full top-full left-0">
          <div className="flex flex-col">
            {navLinks.map((item) => (
              <Link 
                key={item.name} 
                href={item.path} 
                className="text-slate-700 hover:text-blue-600 font-bold py-3 text-lg border-b border-slate-100 transition-colors" 
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="pt-4 flex flex-col gap-3">
            <Link 
              href="/login" 
              onClick={() => setIsMenuOpen(false)}
              className="block text-center text-slate-700 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl font-bold text-lg border border-slate-200 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-lg shadow-md transition-colors"
            >
              Register Cafe
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}