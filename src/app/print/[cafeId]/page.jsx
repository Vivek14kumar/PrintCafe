"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  UploadCloud, FileText, RefreshCw, CheckCircle, Store, AlertCircle, 
  Loader2, CreditCard, UserSquare, Smartphone, Banknote, Image as ImageIcon, 
  X, Lock, Printer, Receipt,IndianRupee, FileStack, ChevronRight, Trash2 
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from "react-qr-code"; // 🌟 NEW: QR Code Import

export default function CustomerPrintPortal() {
  const params = useParams();
  const cafeId = params.cafeId; 

  // --- States ---
  const [cafeData, setCafeData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [step, setStep] = useState(1); 
  const [isUploading, setIsUploading] = useState(false);
  
  const [docCategory, setDocCategory] = useState('Document'); // Document, Aadhar, PAN, Voter

  // File & Preview States
  const [files, setFiles] = useState({ doc: null, front: null, back: null });
  const [previews, setPreviews] = useState({ doc: null, front: null, back: null });
  
  const [pdfTotalPages, setPdfTotalPages] = useState(1);

  // Settings & Pricing
  const [printSettings, setPrintSettings] = useState({ type: 'BW', copies: 1, pageRange: 'All' });
  const [calculatedPages, setCalculatedPages] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const [customerName, setCustomerName] = useState('');
  const [orderToken, setOrderToken] = useState('');

  // 🌟 NEW STATES: QR Code Popup & Link
  const [showQRModal, setShowQRModal] = useState(false);
  const [upiLink, setUpiLink] = useState('');
  // 🌟 NEW: Timer States for Payment Modal
  const [timeLeft, setTimeLeft] = useState(300); // 5 मिनट = 300 सेकंड

  // Local Storage States
  const [sessionTokens, setSessionTokens] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activePrintTokens');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [printedTokens, setPrintedTokens] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('printedTokens');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [rejectedTokens, setRejectedTokens] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rejectedTokens');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [hiddenTokens, setHiddenTokens] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hiddenTokens');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('activePrintTokens', JSON.stringify(sessionTokens));
  }, [sessionTokens]);

  // Auto-Cleanup (12 Hours)
  useEffect(() => {
    const lastVisit = localStorage.getItem('printLastVisit');
    const now = new Date().getTime();

    if (lastVisit && now - parseInt(lastVisit) > 12 * 60 * 60 * 1000) {
      localStorage.removeItem('activePrintTokens');
      localStorage.removeItem('printedTokens');
      localStorage.removeItem('hiddenTokens');
      localStorage.removeItem('rejectedTokens');
      setSessionTokens([]);
      setPrintedTokens([]);
      setHiddenTokens([]);
      setRejectedTokens([]);
    }
    
    localStorage.setItem('printLastVisit', now.toString());
  }, []);

  // Auto-hide printed tokens after 4 seconds
  useEffect(() => {
    const tokensToHide = printedTokens.filter(t => !hiddenTokens.includes(t));
    if (tokensToHide.length > 0) {
      const timer = setTimeout(() => {
        setHiddenTokens(prev => {
          const updated = [...new Set([...prev, ...tokensToHide])];
          localStorage.setItem('hiddenTokens', JSON.stringify(updated));
          return updated;
        });
      }, 4000); 

      return () => clearTimeout(timer);
    }
  }, [printedTokens, hiddenTokens]);

  // Fetch Cafe Details
  useEffect(() => {
    const fetchCafeDetails = async () => {
      try {
        const res = await fetch(`/api/cafe/${cafeId}`);
        const data = await res.json();
        if (data.success) {
          setCafeData(data.cafe);
        } else {
          setError('Invalid Cafe QR Code. Please try again.');
        }
      } catch (err) {
        setCafeData({ shopName: "Smart Print Point", settings: { colorRate: 10, bwRate: 5 }, upiId: "merchant@upi" });
      } finally {
        setPageLoading(false);
      }
    };
    if (cafeId) fetchCafeDetails();
  }, [cafeId]);

  // Parse Page Range
  useEffect(() => {
    const range = printSettings.pageRange.trim();
    if (range.toLowerCase() === 'all' || range === '') {
      setCalculatedPages(pdfTotalPages); 
    } else if (range.includes('-')) {
      const [start, end] = range.split('-').map(num => parseInt(num.trim()));
      if (!isNaN(start) && !isNaN(end) && end >= start) setCalculatedPages(end - start + 1);
    } else if (range.includes(',')) {
      setCalculatedPages(range.split(',').filter(p => p.trim()).length);
    } else if (!isNaN(parseInt(range))) {
      setCalculatedPages(parseInt(range)); 
    }
  }, [printSettings.pageRange, pdfTotalPages]);

  // Calculate Total Price
  useEffect(() => {
    const rate = printSettings.type === 'Color' ? (cafeData?.settings?.colorRate || 10) : (cafeData?.settings?.bwRate || 5);
    const isId = ['Aadhar', 'PAN', 'Voter'].includes(docCategory);
    
    const pagesToCharge = isId ? 1 : calculatedPages;
    setTotalPrice(pagesToCharge * printSettings.copies * rate);
  }, [calculatedPages, printSettings.type, printSettings.copies, docCategory, cafeData]);

  // 🌟 NEW: Auto-Close Modal when user returns from UPI App
  useEffect(() => {
    const handleVisibilityChange = () => {
      // अगर मोडल खुला है और यूज़र वापस ब्राउज़र टैब पर आया है
      if (document.visibilityState === "visible" && showQRModal) {
        // थोड़ा डिले (800ms) देकर मोडल को ऑटो-क्लोज कर दें, ताकि एकदम से न भागे
        setTimeout(() => {
          setShowQRModal(false);
        }, 800); 
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [showQRModal]);
  
  // 🌟 NEW: Payment Gateway Timer & Auto-Close Logic
  useEffect(() => {
    let interval;
    if (showQRModal) {
      // मोडल खुलते ही टाइमर 5 मिनट (300s) पर सेट करें
      setTimeLeft(300); 
      
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowQRModal(false); // टाइम खत्म होने पर अपने-आप मोडल बंद
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(300); // मोडल बंद होने पर रीसेट कर दें
    }

    return () => clearInterval(interval);
  }, [showQRModal]);

  // टाइम को MM:SS फॉर्मेट में दिखाने के लिए (जैसे 04:59)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // शुरू के 10 सेकंड तक बटन डिसेबल रहेगा
  const isButtonDisabled = timeLeft > 290; 
  const secondsToWait = timeLeft - 290; // उल्टी गिनती (10, 9, 8...)

  // Check Live Status
  const checkLiveStatus = async (tokenNum) => {
    try {
      const res = await fetch(`/api/upload/status?token=${tokenNum}`);
      const data = await res.json();
      
      if (data.success) {
        if (data.isPrinted) {
          setPrintedTokens(prev => {
              if (prev.includes(tokenNum)) return prev;
              const newPrinted = [...prev, tokenNum];
              localStorage.setItem('printedTokens', JSON.stringify(newPrinted));
              return newPrinted;
          });
        } else if (data.isRejected) {
          setRejectedTokens(prev => {
              if (prev.includes(tokenNum)) return prev;
              const newRejected = [...prev, tokenNum];
              localStorage.setItem('rejectedTokens', JSON.stringify(newRejected));
              return newRejected;
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle File Selection & PDF Scanning
  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large! Maximum allowed size is 10MB.");
      return;
    }

    setFiles(prev => ({ ...prev, [type]: file }));
    const objectUrl = URL.createObjectURL(file);
    setPreviews(prev => ({ ...prev, [type]: objectUrl }));

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file); 
      
      reader.onloadend = () => {
        const text = new TextDecoder('ascii').decode(reader.result);

        if (!text.startsWith('%PDF-')) {
          alert("Error: This file is corrupted or is not a valid PDF.");
          clearFile(type); 
          return;
        }

        if (text.includes('/Encrypt')) {
          alert("Error: This PDF is password-protected. Please unlock it and try uploading again.");
          clearFile(type); 
          return;
        }

        const matches = text.match(/\/Type\s*\/Page\b/g);
        const count = matches ? matches.length : 1;
        setPdfTotalPages(count);
        
        if (printSettings.pageRange.toLowerCase() === 'all') {
          setCalculatedPages(count);
        }
      };
    } else {
      setPdfTotalPages(1);
      if (printSettings.pageRange.toLowerCase() === 'all') setCalculatedPages(1);
    }
  };

  const clearFile = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
    if (previews[type]) URL.revokeObjectURL(previews[type]); 
    setPreviews(prev => ({ ...prev, [type]: null }));
  };

  // Validation
  const validateStep1 = () => {
    const isId = ['Aadhar', 'PAN', 'Voter'].includes(docCategory);
    if (isId && (!files.front || !files.back)) {
      alert(`Please upload both FRONT and BACK sides of your ${docCategory}.`);
      return;
    }
    if (!isId && !files.doc) {
      alert("Please upload a document to proceed.");
      return;
    }
    setStep(2);
  };

  // 🌟 UPDATED: 1-Click Upload & Payment
  const handlePaymentAndSubmit = async (method) => {
    setIsUploading(true);

    // Prepare UPI URL if selected
    let generatedUpiUrl = '';
    if (method === 'UPI') {
      generatedUpiUrl = `upi://pay?pa=${cafeData?.upiId || 'merchant@upi'}&pn=${cafeData?.shopName}&am=${totalPrice}&cu=INR`;
      setUpiLink(generatedUpiUrl);
    }

    const formData = new FormData();
    formData.append('cafeId', cafeId);
    formData.append('printType', printSettings.type);
    formData.append('copies', printSettings.copies);
    formData.append('docCategory', docCategory);
    formData.append('paymentMethod', method);
    formData.append('totalPrice', totalPrice);
    formData.append('customerName', customerName || 'Guest');
    formData.append('pageRange', printSettings.pageRange === 'All' ? calculatedPages.toString() : printSettings.pageRange);
    
    const isId = ['Aadhar', 'PAN', 'Voter'].includes(docCategory);
    if (isId) {
        formData.append('fileFront', files.front);
        formData.append('fileBack', files.back);
    } else {
        formData.append('file', files.doc);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setOrderToken(data.tokenNumber);
        setSessionTokens(prev => [...prev, data.tokenNumber]);
        setIsUploading(false);
        setStep(4); 

        // 🌟 Smart Device Detection & App Launch
        if (method === 'UPI') {
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          if (isMobile) {
            window.location.href = generatedUpiUrl; // Direct App open
            setShowQRModal(true); // Fallback if app doesn't open
          } else {
            setShowQRModal(true); // Desktop -> Show QR
          }
        }
      } else {
        alert(data.message || "Failed to upload file to the server.");
        setIsUploading(false);
      }
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Network error while processing. Please try again.");
      setIsUploading(false);
    }
  };

  const isIdMode = ['Aadhar', 'PAN', 'Voter'].includes(docCategory);

  const renderPreviewBox = (type, label) => {
    const file = files[type];
    const previewUrl = previews[type];

    if (!file) {
      return (
        <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-indigo-200 bg-white/50 hover:bg-indigo-50/50 hover:border-indigo-400 transition-all duration-300 rounded-2xl cursor-pointer group shadow-sm">
          <div className="bg-indigo-50 p-4 rounded-full shadow-inner mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
            {isIdMode ? <ImageIcon className="w-8 h-8 text-indigo-500" /> : <UploadCloud className="w-8 h-8 text-indigo-500" />}
          </div>
          <span className="text-slate-700 font-semibold tracking-tight text-lg">Select {label}</span>
          <span className="text-sm text-slate-400 mt-1 font-medium">PDF, JPG, PNG (Max 10MB)</span>
          <input type="file" className="hidden" accept=".pdf, image/*" onChange={(e) => handleFileChange(type, e)} />
        </label>
      );
    }

    const isPdf = file.type === 'application/pdf';

    return (
      <div className="relative w-full h-56 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden group flex flex-col shadow-inner">
        <button onClick={() => clearFile(type)} className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-600 p-2 rounded-full z-10 hover:bg-red-50 hover:text-red-600 shadow-sm transition-all">
          <X className="w-4 h-4 font-bold" />
        </button>
        
        <div className="flex-1 w-full relative p-4 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          {isPdf ? (
            <div className="flex flex-col items-center justify-center w-full h-full bg-white rounded-xl shadow-sm border border-slate-100">
              <FileText className="w-14 h-14 text-indigo-500 mb-3" />
              <span className="text-sm font-semibold text-slate-700 truncate px-6 max-w-full">{file.name}</span>
              <span className="text-xs text-slate-400 mt-1">{pdfTotalPages} Pages Detected</span>
            </div>
          ) : (
            <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-sm" />
          )}
        </div>
        <div className="bg-white p-3 text-center border-t border-slate-100 flex items-center justify-center gap-2">
           <CheckCircle className="w-4 h-4 text-emerald-500" />
           <span className="text-sm font-semibold text-slate-700 truncate">{label} Ready</span>
        </div>
      </div>
    );
  };

  const visibleTokens = sessionTokens.filter(token => !hiddenTokens.includes(token));

  // --- Main UI ---
  if (pageLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div>;
  if (error) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4"><div className="bg-red-50 p-6 rounded-3xl text-red-600 font-bold max-w-md w-full border border-red-100 shadow-sm text-center"><AlertCircle className="w-12 h-12 mb-3 mx-auto" />{error}</div></div>;

  return (
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] flex flex-col items-center p-4 sm:p-6 font-sans pb-24">
      
      {/* Header */}
      <header className="w-full max-w-md flex flex-col items-center py-6 mb-2">
        <div className="p-1 rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                    <Image 
                      src="/logo.png" 
                      alt="PrintCafe Logo" 
                      width={46} 
                      height={46} 
                      className="object-contain mix-blend-multiply rounded-md"
                    />
                  </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center">
          {cafeData?.shopName}
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Cafe Print Portal</p>
      </header>

      <main className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden relative flex flex-col">
        
        {/* Progress Bar indicator */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 z-10">
            <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }} />
        </div>

        {/* STEP 1: UPLOAD & PREVIEW */}
        {step === 1 && (
          <div className="p-6 sm:p-8 animate-in fade-in duration-500 flex-1">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">What are you printing?</h2>
                <p className="text-slate-500 text-sm mt-1">Select document type and upload</p>
            </div>

            <input 
               type="text" 
               placeholder="Your Name (Optional)" 
               value={customerName}
               onChange={(e) => setCustomerName(e.target.value)}
               className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700"
            />
            
            <div className="grid grid-cols-4 gap-3 mb-8">
              {[
                { id: 'Document', icon: FileText, label: 'Doc/Img' },
                { id: 'Aadhar', icon: UserSquare, label: 'Aadhar' },
                { id: 'PAN', icon: CreditCard, label: 'PAN' },
                { id: 'Voter', icon: CreditCard, label: 'Voter' }
              ].map(cat => (
                <button key={cat.id} onClick={() => {setDocCategory(cat.id); setFiles({doc:null, front:null, back:null});}} 
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200 ${docCategory === cat.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}`}>
                  <cat.icon className={`w-6 h-6 ${docCategory === cat.id ? 'text-indigo-100' : 'text-slate-400'}`} />
                  <span className="text-[11px] font-semibold tracking-wide">{cat.label}</span>
                </button>
              ))}
            </div>
            
            <div className="space-y-4 mb-6">
              {!isIdMode ? (
                renderPreviewBox('doc', 'Document')
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderPreviewBox('front', 'Front Side')}
                  {renderPreviewBox('back', 'Back Side')}
                </div>
              )}
            </div>

            <button onClick={validateStep1} className="w-full group bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-[0.98]">
              Proceed to Settings <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* STEP 2: SETTINGS & CALCULATION */}
        {step === 2 && (
          <div className="p-6 sm:p-8 animate-in slide-in-from-right duration-300 flex-1">
             <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800">Print Settings</h2>
                <p className="text-slate-500 text-sm mt-1">Customize your physical output</p>
            </div>

            <div className="space-y-8">
                {/* Setting 1: Quality */}
                <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">1. Color Quality</h3>
                    <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setPrintSettings({...printSettings, type: 'BW'})} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${printSettings.type === 'BW' ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <span className="font-bold text-lg">Black & White</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md mt-1 ${printSettings.type === 'BW' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>₹{cafeData?.settings?.bwRate || 5} / pg</span>
                    </button>
                    <button onClick={() => setPrintSettings({...printSettings, type: 'Color'})} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${printSettings.type === 'Color' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <span className="font-bold text-lg">Color Print</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md mt-1 ${printSettings.type === 'Color' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'}`}>₹{cafeData?.settings?.colorRate || 10} / pg</span>
                    </button>
                    </div>
                </div>

                {/* Setting 2: Pages (Docs only) */}
                {!isIdMode && (
                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">2. Pages to Print</h3>
                            <span className="text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-xs font-bold">Total: {calculatedPages} pg</span>
                        </div>
                        <input type="text" value={printSettings.pageRange} onChange={(e) => setPrintSettings({...printSettings, pageRange: e.target.value})}
                            placeholder="e.g., All, 1-5, or enter total pages" 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all font-semibold text-slate-700" />
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                            <FileStack className="w-3.5 h-3.5" />
                            {files.doc?.type === 'application/pdf' 
                            ? `${pdfTotalPages} pages detected in PDF. Leave "All" or type range (e.g. 1-5).` 
                            : 'Leave "All" for single page, or specify count.'}
                        </p>
                    </div>
                )}

                {/* Setting 3: Copies */}
                <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">{!isIdMode ? '3.' : '2.'} Number of Copies</h3>
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                    <button onClick={() => setPrintSettings({...printSettings, copies: Math.max(1, printSettings.copies - 1)})} className="w-14 h-14 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-2xl flex items-center justify-center shadow-sm transition-colors">-</button>
                    <span className="text-3xl font-black flex-1 text-center text-slate-800">{printSettings.copies}</span>
                    <button onClick={() => setPrintSettings({...printSettings, copies: printSettings.copies + 1})} className="w-14 h-14 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-2xl flex items-center justify-center shadow-sm transition-colors">+</button>
                    </div>
                </div>
            </div>

            <div className="mt-10 space-y-3">
                <button onClick={() => setStep(3)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl font-bold text-lg flex justify-between items-center px-6 shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all">
                <span>Continue to Pay</span>
                <span className="bg-indigo-800 text-indigo-50 px-3 py-1.5 rounded-lg text-sm">₹ {totalPrice}</span>
                </button>
                <button onClick={() => setStep(1)} className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-bold text-sm py-3 rounded-xl transition-colors">Go Back</button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT METHOD */}
        {step === 3 && (
            <div className="p-6 sm:p-8 animate-in slide-in-from-right duration-300 text-center flex-1">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                    <Banknote className="w-8 h-8" />
                </div>
                <p className="text-slate-500 font-semibold mb-1 uppercase tracking-widest text-xs">Total Amount Due</p>
                <h2 className="text-6xl font-black text-slate-900 mb-8 tracking-tighter">₹{totalPrice}</h2>
                
                <div className="space-y-4 mb-8">
                    <button onClick={() => handlePaymentAndSubmit('UPI')} disabled={isUploading} className="w-full p-4 border-2 border-emerald-500 bg-emerald-50 text-emerald-900 rounded-2xl flex items-center gap-4 text-left group hover:bg-emerald-100 transition-colors shadow-sm">
                        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center w-20 h-20">
                          {/* Bade size ka UPI Logo */}
                          <img src="/UPI-Logo-vector.svg" alt="UPI" className="w-full h-auto object-contain" />
                        </div>
                        <div>
                        <h4 className="font-bold text-lg leading-tight">Pay via UPI</h4>

                        {/* Icons Container */}
                        <div className="flex items-center gap-3 mt-2.5 opacity-90">
                            {/* GPay Logo */}
                            <img 
                                src="/Google_Pay_Logo.svg" 
                                alt="Google Pay" 
                                className="h-3.5 object-contain" 
                            />

                            {/* PhonePe Logo */}
                            <img 
                                src="/PhonePe_Logo.svg" 
                                alt="PhonePe" 
                                className="h-5 object-contain" 
                            />

                            {/* Paytm Logo */}
                            <img 
                                src="/Paytm.svg" 
                                alt="Paytm" 
                                className="h-3.5 object-contain" 
                            />
                        </div>
                    </div>
                    </button>

                    <button onClick={() => handlePaymentAndSubmit('Cash')} disabled={isUploading} className="w-full p-4 border-2 border-blue-400 bg-blue-50 text-slate-800 rounded-2xl flex items-center gap-4 text-left group hover:border-blue-300 hover:bg-blue-100 transition-colors shadow-sm">
                        <div className="bg-orange-100 p-4 rounded-full border border-orange-200 flex items-center justify-center w-20 h-20">
                          {/* Cash ke liye Rupee Icon */}
                          <IndianRupee className="w-10 h-10 text-orange-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg leading-tight">Pay Cash / Later</h4>
                            <p className="text-xs font-semibold text-slate-500 mt-1">Pay at the shop counter</p>
                        </div>
                    </button>
                </div>

                {isUploading ? (
                    <div className="flex justify-center items-center gap-3 text-indigo-600 font-bold bg-indigo-50 p-4 rounded-2xl">
                        <Loader2 className="w-5 h-5 animate-spin" /> Processing Order...
                    </div>
                ) : (
                    <button onClick={() => setStep(2)} className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-bold text-sm py-3 rounded-xl transition-colors">Back to Settings</button>
                )}
            </div>
        )}

        {/* STEP 4: SUCCESS & TOKENS */}
        {step === 4 && (
          <div className="p-6 sm:p-8 animate-in zoom-in duration-500 bg-slate-900 text-white min-h-[500px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div className="text-center z-10 mb-6 mt-4">
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                    <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Order Received!</h2>
                <p className="text-slate-400 text-sm font-medium">Show your token at the counter</p>
            </div>
            
            <div className="bg-white text-slate-900 p-6 rounded-2xl relative z-10 flex flex-col mt-2 flex-1 shadow-lg">
                <div className="flex items-center justify-between border-b border-dashed border-slate-300 pb-4 mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Printer className="w-4 h-4 text-slate-500" /> Pending Queue
                    </h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">LIVE</span>
                </div>
              
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar flex-1">
                    {visibleTokens.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-6">
                            <CheckCircle className="w-8 h-8 text-emerald-400 mb-2 opacity-50" />
                            <p className="text-sm font-semibold">All tokens printed!</p>
                        </div>
                    ) : (
                        visibleTokens.map((token, index) => {
                            const isDone = printedTokens.includes(token);
                            const isRejected = rejectedTokens.includes(token); 
                            
                            return (
                                <div key={index} className={`p-4 rounded-xl border-l-4 flex justify-between items-center transition-all duration-500 ${
                                    isRejected ? 'bg-red-50 border-red-500 scale-95 opacity-80' : 
                                    isDone ? 'bg-emerald-50 border-emerald-500 scale-95 opacity-80' : 
                                    'bg-indigo-50/50 border-indigo-500'
                                }`}>
                                    <div>
                                        <h4 className={`text-3xl font-black font-mono tracking-tighter ${
                                            isRejected ? 'text-red-400 line-through decoration-red-300' :
                                            isDone ? 'text-slate-400 line-through decoration-slate-300' : 
                                            'text-slate-800'
                                        }`}>
                                            #{token}
                                        </h4>
                                        <p className={`text-xs font-bold mt-1 uppercase tracking-wider ${
                                            isRejected ? 'text-red-600' :
                                            isDone ? 'text-emerald-600' : 
                                            'text-indigo-600'
                                        }`}>
                                            {isRejected ? '❌ Rejected' : isDone ? '✅ Printed' : '⏳ Pending Queue'}
                                        </p>
                                    </div>
                                      
                                    {!isDone && !isRejected && (
                                        <button 
                                            onClick={() => checkLiveStatus(token)}
                                            className="p-3 bg-white hover:bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl transition-colors shadow-sm active:scale-95"
                                            title="Refresh Status"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {sessionTokens.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => {
                                if(window.confirm("Are you sure you want to clear your entire print history?")) {
                                    localStorage.removeItem('activePrintTokens');
                                    localStorage.removeItem('printedTokens');
                                    localStorage.removeItem('hiddenTokens');
                                    localStorage.removeItem('rejectedTokens'); 
                                    
                                    setSessionTokens([]);
                                    setPrintedTokens([]);
                                    setHiddenTokens([]);
                                    setRejectedTokens([]); 
                                    
                                    setStep(1); 
                                }
                            }}
                            className="w-full text-slate-400 hover:text-red-500 hover:bg-red-50 font-bold text-sm py-3 rounded-xl transition-all flex justify-center items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Clear History & Restart
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-6 z-10">
                <button onClick={() => { setStep(1); setFiles({doc:null, front:null, back:null}); setPreviews({doc:null, front:null, back:null}); setOrderToken(''); }} 
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 active:scale-[0.98]">
                    + Print Another Document
                </button>
            </div>
          </div>
        )}

        {/* PREMIUM BOTTOM TOKEN TRACKER */}
        {sessionTokens.length > 0 && step !== 4 && (
          <div className="bg-slate-50 border-t border-slate-200 mt-auto w-full">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="flex items-center gap-3 whitespace-nowrap">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-indigo-500 border-r-purple-500 border-b-emerald-400 animate-spin" style={{ animationDuration: '1.5s' }}></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></div>
                </div>
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Live Queue</span>
              </div>

              <div className="flex gap-2 flex-wrap sm:justify-end">
                {sessionTokens.map(token => {
                  const isDone = printedTokens.includes(token);
                  const isRejected = rejectedTokens.includes(token);

                  return (
                    <button 
                      key={token} 
                      onClick={() => !isDone && !isRejected && checkLiveStatus(token)}
                      disabled={isDone || isRejected}
                      title={(!isDone && !isRejected) ? "Click to refresh status" : ""}
                      className={`whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all shadow-sm focus:outline-none ${
                        isRejected 
                          ? 'bg-red-50 text-red-700 border-red-200 cursor-default opacity-90 line-through decoration-red-300' 
                          : isDone 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default opacity-90' 
                            : 'bg-white text-indigo-700 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-300 active:scale-95 cursor-pointer'
                      }`}
                    >
                      <span>#{token}</span>
                      
                      {isRejected ? (
                         <X className="w-3 h-3 text-red-500 font-bold" />
                      ) : isDone ? (
                         <CheckCircle className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping ml-1"></span>
                      )}
                    </button>
                  );
                })}
              </div>
              
            </div>
            
            {sessionTokens.length > 0 && (
            <div className="border-t border-slate-200/60">
                <button 
                    onClick={() => {
                        if(window.confirm("Are you sure you want to clear your entire print history?")) {
                            localStorage.removeItem('activePrintTokens');
                            localStorage.removeItem('printedTokens');
                            localStorage.removeItem('hiddenTokens');
                            localStorage.removeItem('rejectedTokens');
                            setSessionTokens([]);
                            setPrintedTokens([]);
                            setHiddenTokens([]);
                            setRejectedTokens([]);
                            setStep(1); 
                        }
                    }}
                    className="w-full text-slate-400 hover:text-red-500 hover:bg-red-50 text-xs font-semibold py-3 transition-all flex justify-center items-center gap-2"
                >
                    <Trash2 className="w-3.5 h-3.5" /> Clear History & Restart
                </button>
            </div>
            )}
          </div>
        )}
        
      </main>

      {/* 🌟 PREMIUM PAYMENT MODAL (With Timer & Auto-Close) */}
{showQRModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
    <div className="bg-white rounded-[1.5rem] shadow-2xl max-w-sm w-full overflow-hidden flex flex-col border border-slate-100">

      {/* --- HEADER --- */}
      <div className="bg-slate-50 p-6 text-center relative border-b border-slate-100">
        <button 
          onClick={() => setShowQRModal(false)} 
          className="absolute top-4 right-4 p-2 bg-white text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors shadow-sm border border-slate-200"
        >
          <X className="w-4 h-4 font-bold" />
        </button>

        {/* 🌟 Payment Timer */}
        <div className="absolute top-4 left-4 bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest border border-red-100 flex items-center gap-1.5 animate-pulse">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          {formatTime(timeLeft)}
        </div>

        <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest mt-2">Total Payable</p>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">₹{totalPrice}</h2>
      </div>

      {/* --- BODY --- */}
      <div className="p-6 flex flex-col items-center">
        
        {/* Helper Text */}
        <div className="flex flex-col items-center text-center mb-5">
           <div className="flex items-center gap-2 mb-1">
               <span className="text-sm font-bold text-slate-600">Scan to pay with</span>
               <img src="/UPI-Logo-vector.svg" alt="UPI" className="h-4 object-contain" />
           </div>
           <p className="text-[11px] text-slate-500 font-medium md:hidden">
             Redirecting to UPI App...
           </p>
        </div>

        {/* Premium QR Wrapper */}
        <div className="relative p-3 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 mb-2">
          <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-indigo-500 rounded-br-xl"></div>
          
          <QRCode value={upiLink} size={160} level="H" fgColor="#0f172a" />
        </div>

        {/* --- FOOTER --- */}
        <div className="w-full mt-4 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-center gap-6 opacity-70 mb-5">
              <img src="/Google_Pay_Logo.svg" alt="GPay" className="h-4 object-contain  transition-all cursor-pointer" />
              <img src="/PhonePe_Logo.svg" alt="PhonePe" className="h-5 object-contain  transition-all cursor-pointer" />
              <img src="/Paytm.svg" alt="Paytm" className="h-4 object-contain  transition-all cursor-pointer" />
          </div>

          {/* 🌟 Dynamic "I Have Paid" Button */}
          <button 
            onClick={() => setShowQRModal(false)}
            disabled={isButtonDisabled}
            className={`w-full font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 border ${
              isButtonDisabled 
                ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" 
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 active:scale-95 shadow-sm"
            }`}
          >
            {isButtonDisabled ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                Please verify payment ({secondsToWait}s)
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                I have paid, close this
              </>
            )}
          </button>
          <div className="flex justify-center items-center gap-1.5 text-slate-400 mt-3">
             <Lock className="w-3 h-3" />
             <span className="text-[10px] font-semibold tracking-wide uppercase">100% Secure Payment</span>
          </div>
        </div>

      </div>
    </div>
  </div>
)}

      <p className='mt-4 text-slate-400 items-center text-xs font-semibold'>Powered by Cafe Print</p>
      <Link href="/" className="flex items-center gap-3 group ">
          <div className="p-1 rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Image 
              src="/logo.png" 
              alt="PrintCafe Logo" 
              width={26} 
              height={26} 
              className="object-contain mix-blend-multiply rounded-md"
            />
          </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Cafe<span className='text-blue-600'>Print</span>
            </span>
          </Link>
    </div>
  );
}