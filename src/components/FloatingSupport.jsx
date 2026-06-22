import React from 'react';
import Link from 'next/link';
import { 
   Wallet as WalletIcon, Printer as PrintIcon, MessageCircle
} from 'lucide-react';


// ==========================================
// 2. FLOATING WHATSAPP BUTTON COMPONENT
// ==========================================
export const FloatingSupport = () => {
  // Replace with your actual WhatsApp business number
  const whatsappNumber = "918676880507"; 
  const message = "Hi, I want to know more about the PrintCafe Portal for my Cyber Cafe.";
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={waLink} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group flex items-center justify-center"
    >
      {/* Tooltip */}
      <span className="absolute right-16 bg-white text-slate-800 text-sm font-bold py-2 px-4 rounded-xl shadow-xl border border-slate-200 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 pointer-events-none whitespace-nowrap">
        Chat with Sales
        {/* Little triangle arrow pointing right */}
        <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-t border-r border-slate-200 rotate-45"></span>
      </span>

      {/* Button */}
      <div className="bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_20px_rgba(37,211,102,0.3)] hover:scale-110 transition-transform duration-300 relative">
        <MessageCircle className="w-8 h-8 fill-current" />
        {/* Pulse effect rings */}
        <div className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-20"></div>
      </div>
    </a>
  );
};