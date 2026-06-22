"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Save, Store, IndianRupee, QrCode, Download, RefreshCw, Link as LinkIcon, Printer, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // 🌟 STEP 1: settings में shopCode को भी ऐड कर दिया
  const [settings, setSettings] = useState({
    shopName: '',
    shopCode: '', // नया ऐड किया
    upiId: '',
    bwRate: 5,
    colorRate: 10
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        
        if (data.success && data.profile) {
          setSettings({
            shopName: data.profile.shopName || '',
            shopCode: data.profile.shopCode || '', // 🌟 API से shopCode उठा रहे हैं
            upiId: data.profile.upiId || '',
            bwRate: data.profile.settings?.bwRate || 5,
            colorRate: data.profile.settings?.colorRate || 10,
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setPageLoading(false);
      }
    };
    
    if (status === 'authenticated') fetchProfileData();
  }, [status]);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings) 
      });
      const data = await res.json();
      
      if(data.success) {
        alert("Settings Saved Successfully!");
      } else {
        alert(data.message || "Failed to update settings");
      }
    } catch(error) {
      alert("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // 🌟 STEP 2: डायनामिक बेस URL निकालना (localhost या लाइव वेबसाइट के लिए)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  // अगर API से shopCode नहीं आया तो fallback में 'demo' दिखाएँ
  const shopCodeForQR = settings.shopCode || 'demo';
  // फाइनल प्रिंट लिंक जो कस्टमर खोलेगा (जैसे: http://localhost:3000/print/T9EBML)
  const fullPrintUrl = `${baseUrl}/print/${shopCodeForQR}`;

  const generateA4Poster = async () => {
  if (!settings.shopName) {
    return alert("Please save your Shop Name first before downloading the poster!");
  }
  
  setIsDownloading(true);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1240;
    canvas.height = 1754; // A4 Ratio
    const ctx = canvas.getContext('2d');

    // 1. Clean White Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1240, 1754);

    // 2. Eye-Catching Soft Colorful Corner Orbs (Modern Touch)
    const topGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 800);
    topGradient.addColorStop(0, 'rgba(139, 92, 246, 0.15)'); // Soft Purple
    topGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, 1240, 1754);

    const bottomGradient = ctx.createRadialGradient(1240, 1754, 0, 1240, 1754, 800);
    bottomGradient.addColorStop(0, 'rgba(14, 165, 233, 0.15)'); // Soft Light Blue
    bottomGradient.addColorStop(1, 'rgba(14, 165, 233, 0)');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, 0, 1240, 1754);

    // 3. Colorful Shop Name Banner (Pill Shape)
    const bannerGradient = ctx.createLinearGradient(140, 0, 1100, 0);
    bannerGradient.addColorStop(0, '#4f46e5'); // Indigo
    bannerGradient.addColorStop(0.5, '#7c3aed'); // Purple
    bannerGradient.addColorStop(1, '#db2777'); // Pink
    
    ctx.fillStyle = bannerGradient;
    ctx.shadowColor = 'rgba(124, 58, 237, 0.4)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(140, 120, 960, 160, 80) : ctx.rect(140, 120, 960, 160);
    ctx.fill();
    ctx.shadowColor = 'transparent'; // Reset Shadow

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 65px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(settings.shopName.toUpperCase(), 620, 205, 860); 

    // 4. Vibrant Call to Action Text
    const textGradient = ctx.createLinearGradient(300, 0, 900, 0);
    textGradient.addColorStop(0, '#1e3a8a');
    textGradient.addColorStop(1, '#4c1d95');
    
    ctx.fillStyle = textGradient;
    ctx.font = '900 85px "Segoe UI", Arial, sans-serif';
    ctx.fillText('SCAN TO PRINT', 620, 420);
    
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Fast, Secure & Hassle-Free Document Printing', 620, 490);

    // 5. QR Code with Gradient Scanner Brackets
    const qrSize = 560;
    const qrX = 340;
    const qrY = 580;

    // Gradient Brackets
    ctx.strokeStyle = bannerGradient; // Reuse the colorful gradient
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const cornerSize = 70;
    const padding = 40; 

    // Top-Left
    ctx.beginPath(); ctx.moveTo(qrX - padding, qrY - padding + cornerSize); ctx.lineTo(qrX - padding, qrY - padding); ctx.lineTo(qrX - padding + cornerSize, qrY - padding); ctx.stroke();
    // Top-Right
    ctx.beginPath(); ctx.moveTo(qrX + qrSize + padding - cornerSize, qrY - padding); ctx.lineTo(qrX + qrSize + padding, qrY - padding); ctx.lineTo(qrX + qrSize + padding, qrY - padding + cornerSize); ctx.stroke();
    // Bottom-Left
    ctx.beginPath(); ctx.moveTo(qrX - padding, qrY + qrSize + padding - cornerSize); ctx.lineTo(qrX - padding, qrY + qrSize + padding); ctx.lineTo(qrX - padding + cornerSize, qrY + qrSize + padding); ctx.stroke();
    // Bottom-Right
    ctx.beginPath(); ctx.moveTo(qrX + qrSize + padding - cornerSize, qrY + qrSize + padding); ctx.lineTo(qrX + qrSize + padding, qrY + qrSize + padding); ctx.lineTo(qrX + qrSize + padding, qrY + qrSize + padding - cornerSize); ctx.stroke();

    // 🌟 Load and Draw QR Code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(fullPrintUrl)}&color=0f172a&bgcolor=ffffff&margin=0`;
    const qrImg = new Image();
    qrImg.crossOrigin = 'Anonymous'; 
    qrImg.src = qrUrl;

    await new Promise((resolve, reject) => {
      qrImg.onload = () => {
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        resolve();
      };
      qrImg.onerror = () => reject("Failed to load QR image");
    });

    // 6. Professional SVG Icons & Steps (No Emojis)
    // Helper function to load SVG Data URLs
    const loadSvgIcon = (svgData) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = `data:image/svg+xml;charset=utf-8,${svgData}`;
      });
    };

    // Clean SVGs for Phone, Upload, Print, and Arrow
    const phoneSvg = `%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%234f46e5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='5' y='2' width='14' height='20' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='12' y1='18' x2='12.01' y2='18'%3E%3C/line%3E%3C/svg%3E`;
    const uploadSvg = `%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23db2777' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'%3E%3C/path%3E%3Cpolyline points='17 8 12 3 7 8'%3E%3C/polyline%3E%3Cline x1='12' y1='3' x2='12' y2='15'%3E%3C/line%3E%3C/svg%3E`;
    const printSvg = `%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%230ea5e9' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 6 2 18 2 18 9'%3E%3C/polyline%3E%3Cpath d='M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'%3E%3C/path%3E%3Crect x='6' y='14' width='12' height='8'%3E%3C/rect%3E%3C/svg%3E`;
    const arrowSvg = `%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3Cpolyline points='12 5 19 12 12 19'%3E%3C/polyline%3E%3C/svg%3E`;

    const [phoneImg, uploadImg, printImg, arrowImg] = await Promise.all([
      loadSvgIcon(phoneSvg),
      loadSvgIcon(uploadSvg),
      loadSvgIcon(printSvg),
      loadSvgIcon(arrowSvg)
    ]);

    // Background box for steps
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(100, 1320, 1040, 140, 30) : ctx.rect(100, 1320, 1040, 140);
    ctx.fill();
    ctx.stroke();

    // Drawing Icons and Text (Step-by-Step Layout)
    const stepY = 1360;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 30px "Segoe UI", Arial, sans-serif';
    
    // Step 1: Scan
    ctx.drawImage(phoneImg, 150, stepY - 30, 60, 60);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Scan QR', 230, stepY);
    ctx.drawImage(arrowImg, 410, stepY - 20, 40, 40);

    // Step 2: Upload
    ctx.drawImage(uploadImg, 490, stepY - 30, 60, 60);
    ctx.fillText('Upload File', 570, stepY);
    ctx.drawImage(arrowImg, 780, stepY - 20, 40, 40);

    // Step 3: Print
    ctx.drawImage(printImg, 860, stepY - 30, 60, 60);
    ctx.fillText('Get Print', 940, stepY);

    // 7. Subtle Footer Branding
    ctx.fillStyle = '#94a3b8';
    ctx.font = '28px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Powered by ${baseUrl.replace(/^https?:\/\//, '')}`, 620, 1580);

    // Download Logic
    const link = document.createElement('a');
    link.download = `${settings.shopName.replace(/\s+/g, '_')}_Poster.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

  } catch (err) {
    console.error(err);
    alert("Something went wrong while generating the poster.");
  }
  setIsDownloading(false);
};

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-white p-4 rounded-full shadow-lg mb-4">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <p className="text-gray-500 font-bold tracking-wide uppercase text-sm">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shop Settings</h2>
        <p className="text-gray-500 font-medium mt-1">Manage pricing, payment details, and download your shop's QR Poster.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: Form --- */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Store className="w-5 h-5" /></div>
              <h3 className="font-bold text-gray-900 text-lg">Business Details</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Shop Display Name</label>
                <div className="relative group">
                  <Store className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input type="text" name="shopName" value={settings.shopName} onChange={handleChange} placeholder="What should customers see?" className="pl-11 w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-gray-800" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Receiving UPI ID <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-2">100% Secure</span></label>
                <div className="relative group">
                  <IndianRupee className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                  <input type="text" name="upiId" required value={settings.upiId} onChange={handleChange} placeholder="e.g. 9876543210@ybl" className="pl-11 w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-medium text-gray-800" />
                </div>
                <p className="text-xs text-gray-500 mt-2 font-medium">Customer payments will be directly credited to this UPI ID. No middleman.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mt-10 mb-6">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Printer className="w-5 h-5" /></div>
              <h3 className="font-bold text-gray-900 text-lg">Print Pricing</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Black & White (₹/page)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 font-bold text-gray-400">₹</span>
                  <input type="number" name="bwRate" min="1" value={settings.bwRate} onChange={handleChange} className="pl-9 w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-900 text-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Color Print (₹/page)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 font-bold text-gray-400">₹</span>
                  <input type="number" name="colorRate" min="1" value={settings.colorRate} onChange={handleChange} className="pl-9 w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-900 text-lg" />
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-70">
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
                {loading ? "Saving Data..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* --- RIGHT COLUMN: Premium QR Poster Preview --- */}
        <div className="lg:col-span-5">
          <div className="bg-gradient-to-b from-blue-900 to-blue-700 p-8 rounded-3xl shadow-xl flex flex-col items-center text-center relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-10 translate-x-10"></div>
            
            <h3 className="text-xl font-black text-white mb-2 tracking-wide">Your Smart Poster</h3>
            <p className="text-sm text-blue-200 mb-6 font-medium">Print this beautiful A4 poster & stick it on your shop counter.</p>
            
            <div className="bg-white p-5 rounded-2xl shadow-2xl mb-8 transform transition hover:scale-105 duration-300 w-64">
              <h4 className="font-black text-gray-900 text-sm mb-1 truncate">{settings.shopName || "YOUR SHOP NAME"}</h4>
              <p className="text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-widest">Scan to Print</p>
              
              <div className="border border-gray-100 p-2 rounded-xl mb-3 bg-gray-50">
                {/* 🌟 STEP 4: UI वाले छोटे QR कोड को भी सही URL के साथ अपडेट कर दिया */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullPrintUrl)}&color=1e3a8a`} 
                  alt="QR Code" 
                  className="w-full h-auto rounded-lg mix-blend-multiply" 
                />
              </div>
              <div className="flex items-center justify-center gap-1 text-blue-600">
                <ShieldCheck className="w-3 h-3" />
                <span className="text-[9px] font-bold">100% Secure System</span>
              </div>
            </div>

            <button 
              onClick={generateA4Poster}
              disabled={isDownloading}
              className="w-full bg-white text-blue-700 hover:bg-gray-50 font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-80"
            >
              {isDownloading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
              {isDownloading ? "Generating HD Poster..." : "Download A4 Poster"}
            </button>
            
            {/* 🌟 STEP 5: Link Preview को भी असली shopCode के साथ फिक्स कर दिया */}
            <div className="mt-6 w-full bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-hidden text-left">
                <LinkIcon className="w-4 h-4 text-blue-300 flex-shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-yellow-200 font-bold uppercase tracking-wider mb-0.5">Shop Link (Code)</p>
                  <p className="text-[12px] font-bold text-black truncate">{baseUrl.replace(/^https?:\/\//, '')}/print/{shopCodeForQR}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
        
      </div>
      
      {/* PRO TIP: One-Click Print Tutorial Card 
      <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Printer className="w-32 h-32" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-yellow-500 text-black text-xs font-black px-2 py-1 rounded uppercase tracking-wide">Pro Tip</span>
            <h3 className="text-xl font-bold">Enable "Zero-Click" Printing</h3>
          </div>
          <p className="text-gray-300 text-sm mb-4 max-w-2xl">
            Want to print instantly without clicking "OK" or "Enter" every time? Set up Google Chrome's Kiosk Mode for a true Swiggy/Zomato style automatic printing experience.
          </p>
          
          <div className="bg-black/30 rounded-xl p-4 border border-white/10 text-sm space-y-2 max-w-2xl">
            <p><strong>Step 1:</strong> Right-click on your Google Chrome Desktop shortcut and select 'Properties'.</p>
            <p><strong>Step 2:</strong> In the 'Target' box, add <code className="bg-blue-900/50 text-blue-200 px-1.5 py-0.5 rounded">--kiosk-printing</code> at the very end.</p>
            <p className="text-gray-400 italic text-xs mt-2">Example: "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing</p>
          </div>
        </div>
      </div>*/}
    </div>
  );
}