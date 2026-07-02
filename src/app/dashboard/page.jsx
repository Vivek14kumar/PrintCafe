"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Pusher from 'pusher-js'; 
import { Wallet, Edit, PlusCircle, Clock, CheckCircle, XCircle, Printer,IndianRupee, RefreshCw, Eye, Smartphone, Banknote, ShieldAlert, X, TrendingUp, Infinity, Zap, AlertTriangle } from 'lucide-react';
// 🌟 NEW: Toast notification ke liye import
import toast, { Toaster } from 'react-hot-toast';
import ImageEditorModal from '@/components/ImageEditor';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [walletBalance, setWalletBalance] = useState(0);
  const [walletType, setWalletType] = useState('credit');
  const [printQueue, setPrintQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); 
  const [previewJob, setPreviewJob] = useState(null);
  const [earnings, setEarnings] = useState({ today: 0, month: 0, total: 0 });
  const [shopCode, setShopCode] = useState(null);
  const [kioskMode, setKioskMode] = useState(false);
  const [printModalJob, setPrintModalJob] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [recentPrints, setRecentPrints] = useState([]); 

  // 🌟 NEW: Payment check modal ke liye state
  const [paymentCheckJob, setPaymentCheckJob] = useState(null);

  // Image Editor States
  const [editingImageUrl, setEditingImageUrl] = useState(null);
  const [editingJobField, setEditingJobField] = useState(null); // 'fileUrl', 'frontFileUrl', ya 'backFileUrl'
  const [editingJobId, setEditingJobId] = useState(null);

  useEffect(() => {
    const savedKioskSetting = localStorage.getItem('kioskMode');
    if (savedKioskSetting) setKioskMode(JSON.parse(savedKioskSetting));
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.success) {
        setWalletBalance(data.walletBalance);
        setWalletType(data.walletType);
        setPrintQueue(data.queue);
        setShopCode(data.shopCode);
        setEarnings({
          today: data.stats.todayEarnings || 0,
          month: data.stats.monthlyEarnings || 0,
          total: data.stats.totalEarnings || 0
        });
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  useEffect(() => {
    if (!shopCode) return;
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
    const channel = pusher.subscribe(`shop-${shopCode}`);
    channel.bind('incoming-print', (newJob) => {
      setPrintQueue((prevQueue) => [newJob, ...prevQueue]);
      toast.success(`New print job from ${newJob.customerName || 'Customer'}!`);
    });
    return () => {
      pusher.unsubscribe(`shop-${shopCode}`);
    };
  }, [shopCode]); 
  
  const triggerDeduction = async (jobId) => {
    try {
      const res = await fetch('/api/jobs/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action: 'approve' })
      });
      const data = await res.json();
      
      if (data.success) {
        setPrintQueue(prevQueue => prevQueue.filter(q => q._id !== jobId));
        const completedJob = { ...printModalJob, printedAt: new Date(), backupUrl: pdfBlobUrl };
        setRecentPrints(prev => [completedJob, ...prev]);

        setTimeout(() => {
          setRecentPrints(prev => prev.filter(job => job._id !== jobId));
          if (completedJob.backupUrl && !completedJob.backupUrl.includes('docs.google.com')) {
            URL.revokeObjectURL(completedJob.backupUrl); 
          }
        }, 10 * 60 * 1000);

        closePrintFrame(true);
        fetchDashboardData(); 
        toast.success("Print complete & wallet updated!");
      } else {
        toast.error(data.message || "Wallet deduction failed! Please recharge.");
      }
    } catch (apiErr) {
      console.error("Auto deduction failed", apiErr);
      toast.error("Something went wrong!");
    }
  };

  /*const openPrintFrame = async (job) => {
    setActionLoading(job._id);
    try {
      if (job.frontFileUrl && job.backFileUrl) {
        const htmlContent = `
          <html>
            <head>
              <style>
                body { margin: 0; display: flex; flex-direction: row; justify-content: center; align-items: flex-start; gap: 15px; background: white; padding-top: 40px; }
                img { width: 45%; max-height: 50vh; object-fit: contain; padding: 2px; }
                @media print {
                  @page { margin: 10mm; }
                  body { padding-top: 20px; }
                  img { page-break-inside: avoid; }
                }
              </style>
            </head>
            <body oncontextmenu="return false;">
              <img src="${job.frontFileUrl}" crossorigin="anonymous" />
              <img src="${job.backFileUrl}" crossorigin="anonymous" />
            </body>
          </html>
        `;
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        setPdfBlobUrl(URL.createObjectURL(htmlBlob));
        setPrintModalJob(job);
        setPreviewJob(null);
        return;
      }

      const fileResponse = await fetch(job.fileUrl);
      if (!fileResponse.ok) throw new Error("CORS Blocked");
      
      const rawBlob = await fileResponse.blob();
      const secureBlob = new Blob([rawBlob], { type: 'application/pdf' });
      const securedUrl = URL.createObjectURL(secureBlob) + '#toolbar=0&navpanes=0&scrollbar=0';
      
      setPdfBlobUrl(securedUrl);
      setPrintModalJob(job);
      setPreviewJob(null);

    } catch (error) {
      console.warn("Direct load failed, using Google Docs Fallback");
      setPdfBlobUrl(`https://docs.google.com/gview?url=${job.fileUrl}&embedded=true`);
      setPrintModalJob({ ...job, isCorsFallback: true });
      setPreviewJob(null);
    } finally {
      setActionLoading(null);
    }
  };*/
  const openPrintFrame = async (job) => {
    setActionLoading(job._id);
    try {
      // 🌟 UPDATED: Handle ID Cards even if only one side is uploaded
      const isIdCategory = ['Aadhar', 'PAN', 'Voter', 'Other ID'].includes(job.docCategory);
      
      if (isIdCategory && (job.frontFileUrl || job.backFileUrl)) {
        const imagesToRender = [];
        if (job.frontFileUrl) imagesToRender.push(`<img src="${job.frontFileUrl}" crossorigin="anonymous" />`);
        if (job.backFileUrl) imagesToRender.push(`<img src="${job.backFileUrl}" crossorigin="anonymous" />`);
        const htmlContent = `
          <html>
            <head>
              <style>
                body { margin: 0; display: flex; flex-direction: row; justify-content: center; align-items: flex-start; gap: 15px; background: white; padding-top: 40px; }
                img { width: 45%; max-height: 50vh; object-fit: contain; padding: 2px; }
                @media print {
                  @page { margin: 10mm; }
                  body { padding-top: 20px; }
                  img { page-break-inside: avoid; }
                }
              </style>
            </head>
            <body oncontextmenu="return false;">
              <img src="${job.frontFileUrl}" crossorigin="anonymous" />
              <img src="${job.backFileUrl}" crossorigin="anonymous" />
            </body>
          </html>
        `;
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        setPdfBlobUrl(URL.createObjectURL(htmlBlob));
        setPrintModalJob(job);
        setPreviewJob(null);
        return;
      }

      // 2. Handle Single File
      const fileResponse = await fetch(job.fileUrl);
      if (!fileResponse.ok) throw new Error("CORS Blocked");
      
      const rawBlob = await fileResponse.blob();
      const urlLower = job.fileUrl.toLowerCase();
      
      // 🌟 NAYA LOGIC: Check Blob Type OR URL Structure for Cloudinary Raw files
      const isImage = 
        rawBlob.type.startsWith('image/') || 
        urlLower.includes('/images/') || 
        urlLower.includes('img-');

      if (isImage) {
        const htmlContent = `
          <html>
            <head>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: flex-start; padding-top: 20px; background: white; }
                img { max-width: 90%; max-height: 90vh; object-fit: contain; }
                @media print {
                  @page { margin: 10mm; }
                  body { padding-top: 0; display: block; }
                  img { max-width: 100%; max-height: none; page-break-inside: avoid; }
                }
              </style>
            </head>
            <body oncontextmenu="return false;">
              <img src="${job.fileUrl}" crossorigin="anonymous" />
            </body>
          </html>
        `;
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        setPdfBlobUrl(URL.createObjectURL(htmlBlob));
      } else {
        // Agar image nahi hai, toh ise PDF manenge (jaise aapke jameen se sambandhit form wale PDFs)
        const secureBlob = new Blob([rawBlob], { type: 'application/pdf' });
        const securedUrl = URL.createObjectURL(secureBlob) + '#toolbar=0&navpanes=0&scrollbar=0';
        setPdfBlobUrl(securedUrl);
      }

      setPrintModalJob(job);
      setPreviewJob(null);

    } catch (error) {
      console.warn("Direct load failed, using Fallback");
      
      const urlLower = job.fileUrl.toLowerCase();
      // Fallback me bhi wahi smart check lagaya gaya hai
      const isImageFallback = 
        urlLower.match(/\.(jpeg|jpg|png|gif|webp)$/i) || 
        urlLower.includes('/images/') || 
        urlLower.includes('img-');

      setPdfBlobUrl(isImageFallback ? job.fileUrl : `https://docs.google.com/gview?url=${job.fileUrl}&embedded=true`);
      setPrintModalJob({ ...job, isCorsFallback: true });
      setPreviewJob(null);
    } finally {
      setActionLoading(null);
    }
  };

  const executeWindowPrint = () => {
    if (printModalJob.isCorsFallback) {
      printJS({
        printable: printModalJob.fileUrl,
        type: printModalJob.fileUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
        showModal: true,
        modalMessage: 'Sending document to printer...',
        onPrintDialogClose: () => triggerDeduction(printModalJob._id)
      });
      return;
    }
    
    const iframe = document.getElementById('visible-print-frame');
    if (iframe) {
      // Ek variable taaki deduction multiple times call na ho jaye
      let hasExecuted = false; 

      const onPrintDialogClose = () => {
        if (hasExecuted) return;
        hasExecuted = true;
        
        triggerDeduction(printModalJob._id); // Ye successfully run hokar modal close kar dega
        
        // Listeners ko clean kar do
        window.removeEventListener('focus', onPrintDialogClose);
        window.removeEventListener('mousemove', onPrintDialogClose);
      };

      iframe.contentWindow.focus();
      
      // Method 1: Chrome/Edge native afterprint event (Sabse best)
      iframe.contentWindow.addEventListener('afterprint', onPrintDialogClose);
      
      iframe.contentWindow.print();
      
      // Method 2: Fallback triggers (Agar afterprint miss ho jaye)
      // Print button dabane ke 1 second baad mouse move ya focus ka wait karega
      setTimeout(() => {
        window.addEventListener('focus', onPrintDialogClose);
        window.addEventListener('mousemove', onPrintDialogClose);
      }, 1000);
    }
  };

  const closePrintFrame = (isSuccess = false) => {
  setPrintModalJob(null);
  
  // URL se '#' ke baad ka part hata do taaki revokeObjectURL crash na ho
  const cleanUrl = pdfBlobUrl ? pdfBlobUrl.split('#')[0] : null;

  // Agar print success nahi hua hai (yani Cancel ya X dabaya gaya hai)
  // Tabhi memory turant clear karo. Success hone par mat karo (kyunki Recent Prints ko 10 min tak chahiye)
  if (isSuccess !== true && cleanUrl && !cleanUrl.includes('docs.google.com')) {
    URL.revokeObjectURL(cleanUrl); 
  }
  
  setPdfBlobUrl(null);
};

  const handleReject = async (job) => {
    if (!window.confirm("Are you sure you want to reject and delete this print request?")) return;
    
    setActionLoading(job._id);
    try {
      const res = await fetch('/api/jobs/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job._id, action: 'reject' })
      });
      const result = await res.json();
      if (result.success) {
        setPrintQueue(prevQueue => prevQueue.filter(q => q._id !== job._id));
        toast.success("Print job rejected.");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setActionLoading(null);
    }
  };

  if (status === "loading" || loading) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="relative">
        {/* Printer */}
        <Printer className="w-20 h-20 text-blue-600" />

        {/* Moving Paper */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-5 w-8 h-4 bg-white border rounded animate-bounce"></div>
      </div>

      <p className="mt-6 text-lg font-medium text-gray-700 animate-pulse">
        Loading...
      </p>
    </div>
  );
}

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* 🌟 NEW: Toaster Component for Toast notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Header & Stats (Unchanged) */}
      <header className="mb-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Dashboard</h2>
            <p className="text-gray-500 font-medium mt-1">Manage print queue and verify payments securely.</p>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5"><TrendingUp className="w-24 h-24" /></div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Today's Income</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">₹{earnings.today.toFixed(2)}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5"><TrendingUp className="w-24 h-24" /></div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">This Month</p>
            <p className="text-3xl font-black text-blue-600 mt-1">₹{earnings.month.toFixed(2)}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5"><TrendingUp className="w-24 h-24" /></div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Lifetime Income</p>
            <p className="text-3xl font-black text-gray-900 mt-1">₹{earnings.total.toFixed(2)}</p>
          </div>
          <div className="bg-gray-900 p-5 rounded-2xl shadow-md border border-gray-800 flex flex-col justify-center relative overflow-hidden text-white">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Wallet Balance</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${walletType === 'unlimited' ? 'bg-indigo-500/30 text-indigo-200' : 'bg-gray-700 text-gray-300'}`}>
                    {walletType}
                  </span>
                </div>
                <p className={`text-3xl font-black leading-none mt-1 ${walletType !== 'unlimited' && walletBalance < 10 ? 'text-red-400' : 'text-white'}`}>
                  {walletType === 'unlimited' ? 'Unlimited' : `${walletBalance} Cr`}
                </p>
              </div>
              <div className="bg-gray-800 p-2.5 rounded-xl">
                {walletType === 'unlimited' ? <Infinity className="w-5 h-5 text-indigo-400" /> : <Wallet className="w-5 h-5 text-gray-300" />}
              </div>
            </div>
            {walletType !== 'unlimited' && (
              <Link href={'/dashboard/wallet'} className="mt-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition w-full">
                <PlusCircle className="w-3.5 h-3.5" /> Recharge Now
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Live Queue Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" /> Live Print Queue
          </h3>
          <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-100">
            {printQueue.length} Pending
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-bold">Document Info</th>
                <th className="p-4 font-bold">Print Settings</th>
                <th className="p-4 font-bold">Payment Status</th>
                <th className="p-4 font-bold text-right">Review & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {printQueue.map((job) => (
                <tr key={job._id} className="hover:bg-blue-50/30 transition group">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-gray-900 text-white text-xs font-black px-2 py-0.5 rounded">#{job.tokenNumber}</span>
                        <span className="text-sm font-bold text-gray-800">{job.customerName}</span>
                      </div>
                      <span className="font-bold text-gray-900 flex items-center gap-2">
                        {job.docCategory}
                      </span>

                      {/* 🌟 NAYA: Open Pro Studio Buttons (Merged Front/Back & JobId) */}
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {(job.docCategory === 'Image' || job.docCategory === 'Other ID') && job.fileUrl && (
                          <button 
                            onClick={() => router.push(`/dashboard/studio?jobId=${job._id}&imageUrl=${encodeURIComponent(job.fileUrl)}`)} 
                            className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold border border-blue-100 hover:bg-blue-100 flex items-center gap-1"
                          >
                            <Edit size={14}/> Edit in Studio
                          </button>
                        )}
                        {(job.docCategory === 'Aadhar' || job.docCategory === 'PAN' || job.docCategory === 'Voter' || job.docCategory === 'Other ID') && (job.frontFileUrl || job.backFileUrl) && (
                          <button 
                            onClick={() => {
                              let url = `/dashboard/studio?jobId=${job._id}`;
                              if (job.frontFileUrl) url += `&frontUrl=${encodeURIComponent(job.frontFileUrl)}`;
                              if (job.backFileUrl) url += `&backUrl=${encodeURIComponent(job.backFileUrl)}`;
                              router.push(url);
                            }} 
                            className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold border border-blue-100 hover:bg-blue-100 flex items-center gap-1"
                          >
                            <Edit size={14}/> Edit {job.docCategory} Card
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{job.printType} Print</span>
                      <span className="text-xs text-gray-600 font-medium">Pages: {job.pageRange}</span>
                      <span className="text-[10px] text-gray-500">Copies: {job.copies}</span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-lg font-black text-gray-900">₹{job.totalAmount}</span>
                      {job.paymentMethod === 'UPI' ? (
                          <span className="inline-flex items-center gap-1.5 bg-white text-gray-700 border border-gray-200 shadow-sm px-2.5 py-1 rounded-lg text-xs font-bold">
                            {/* UPI Official Logo from Wikimedia */}
                            <img src="/UPI-Logo-vector.svg" alt="UPI" className="h-3.5" /> 
                            Check UPI
                          </span>
                      ) : (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                            <IndianRupee className="w-3.5 h-3.5" /> Collect Cash
                          </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* 🌟 NEW: onClick event changed to trigger our new paymentCheckJob state instead of directly opening the print modal */}
                      <button 
                        onClick={() => setPaymentCheckJob(job)} 
                        disabled={actionLoading === job._id} 
                        className={`${kioskMode ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'} text-white p-2.5 rounded-xl transition disabled:opacity-50 flex items-center gap-1 shadow-sm`} 
                        title="Print Document"
                      >
                        {actionLoading === job._id ? <RefreshCw className="w-4 h-4 animate-spin" /> : (kioskMode ? <Zap className="w-4 h-4" /> : <Printer className="w-4 h-4" />)}
                        <span className="text-xs font-bold hidden sm:inline">{kioskMode ? 'Fast Print' : 'Print'}</span>
                      </button>

                      <button onClick={() => handleReject(job)} disabled={actionLoading === job._id} className="bg-white hover:bg-red-50 text-red-500 border border-gray-200 p-2.5 rounded-xl transition disabled:opacity-50" title="Reject">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {printQueue.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <Printer className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="font-bold text-gray-800 text-lg">Queue is Empty</p>
                      <p className="text-sm text-gray-500 mt-1">Waiting for customers to send documents...</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* RECENT PRINTS (Unchanged) */}
      {recentPrints.length > 0 && (
        <section className="mt-8 bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -z-10 opacity-50 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="p-5 border-b border-orange-100 flex justify-between items-center bg-orange-50/30">
            <div>
              <h3 className="text-lg font-black text-orange-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" /> Recent Prints (Backup)
              </h3>
              <p className="text-xs text-orange-600 font-medium mt-1">
                Paper jam? Reprint from here for free. Files will auto-delete in 10 minutes.
              </p>
            </div>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-xs font-bold border border-orange-200">
              {recentPrints.length} Saved
            </span>
          </div>
          
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPrints.map((job) => (
              <div key={`recent-${job._id}`} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition group flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                      #{job.tokenNumber}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {job.printedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{job.customerName || 'Customer'}</h4>
                  <p className="text-xs text-gray-500 font-medium truncate">{job.docCategory}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                  <button 
                    onClick={() => {
                      const printFrame = document.createElement('iframe');
                      printFrame.style.display = 'none';
                      printFrame.src = job.backupUrl;
                      document.body.appendChild(printFrame);
                      printFrame.onload = () => {
                        printFrame.contentWindow.focus();
                        printFrame.contentWindow.print();
                        setTimeout(() => document.body.removeChild(printFrame), 5000);
                      };
                    }}
                    className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 py-2 rounded-lg text-xs font-bold transition flex justify-center items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Free Reprint
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* 🚀 NEW: PAYMENT VERIFICATION MODAL */}
      {/* ========================================== */}
      {paymentCheckJob && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            
            {/* Header Area Based on Payment Method */}
            <div className={`p-8 text-center ${paymentCheckJob.paymentMethod === 'UPI' ? 'bg-purple-50' : 'bg-green-50'}`}>
              <div className="flex justify-center mb-4">
                {paymentCheckJob.paymentMethod === 'UPI' ? (
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center w-20 h-20">
                    {/* Bade size ka UPI Logo */}
                    <img src="/UPI-Logo-vector.svg" alt="UPI" className="w-full h-auto object-contain" />
                  </div>
                ) : (
                  <div className="bg-green-100 p-4 rounded-full border border-green-200 flex items-center justify-center w-20 h-20">
                    {/* Cash ke liye Rupee Icon */}
                    <IndianRupee className="w-10 h-10 text-green-600" />
                  </div>
                )}
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                Verify Payment of ₹{paymentCheckJob.totalAmount}
              </h3>
              
              <div className="flex items-center justify-center gap-2 text-sm font-bold mb-4">
                <span className="text-gray-500">Method:</span>
                <span className={`px-2 py-0.5 rounded ${paymentCheckJob.paymentMethod === 'UPI' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                  {paymentCheckJob.paymentMethod}
                </span>
              </div>

              <p className="text-sm font-medium text-gray-600 bg-white/60 p-3 rounded-xl inline-flex items-start text-left gap-2 shadow-sm border border-white">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />
                {paymentCheckJob.paymentMethod === 'UPI' 
                  ? "Please check your phone or soundbox to confirm you have received the UPI payment before hitting print." 
                  : "Please make sure to collect the physical cash amount from the customer."}
              </p>
            </div>
            
            {/* Action Buttons Area */}
            <div className="p-4 bg-white flex gap-3">
              <button 
                onClick={() => setPaymentCheckJob(null)} 
                className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                Not Received / Cancel
              </button>
              
              <button 
                onClick={() => {
                  toast.success("Payment verified! Opening print preview...", { icon: '✔' });
                  openPrintFrame(paymentCheckJob);
                  setPaymentCheckJob(null);
                }} 
                className={`flex-1 py-3.5 rounded-xl font-black text-white transition flex justify-center items-center gap-2 shadow-lg ${
                  paymentCheckJob.paymentMethod === 'UPI' 
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30' 
                    : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'
                }`}
              >
                <CheckCircle className="w-5 h-5" /> 
                Payment Done, Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 🚀 THE VISIBLE PRINT FRAME MODAL (Unchanged) */}
      {/* ========================================== */}
      {printModalJob && pdfBlobUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-blue-500">
            
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-black text-gray-900 text-xl flex items-center gap-2">
                  <Printer className="w-6 h-6 text-blue-600" /> Print Ready
                </h3>
                {kioskMode ? (
                  <p className="text-xs text-yellow-600 font-bold mt-1">⚡ Kiosk Mode ON: Sending to printer automatically...</p>
                ) : (
                  <p className="text-xs text-gray-500 font-medium mt-1">Check the document below. Click 'Print Now' to send to printer.</p>
                )}
              </div>
              <button onClick={() => closePrintFrame(false)} className="p-2 bg-gray-200 hover:bg-red-100 hover:text-red-600 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div 
              className="flex-1 bg-gray-200 relative overflow-hidden"
              onContextMenu={(e) => e.preventDefault()} 
            >
              <div 
                className="absolute top-0 left-0 w-full h-[60px] z-10 bg-transparent cursor-not-allowed" 
                title="Security Protected"
              ></div>

              <iframe 
                id="visible-print-frame"
                src={pdfBlobUrl} 
                className={`w-full h-full border-0 relative z-0 ${printModalJob?.printType === 'BW' ? 'grayscale opacity-90' : ''}`}
                title="PDF Print Frame" 
                onLoad={() => {
                  if (kioskMode && !printModalJob?.isCorsFallback) {
                    setTimeout(executeWindowPrint, 800); 
                  }
                }}
              />
            </div>

            <div className="p-5 bg-white border-t border-gray-100 flex justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-gray-900">
                  ₹{printModalJob.totalAmount} <span className="text-sm font-medium text-gray-500">({printModalJob.paymentMethod})</span>
                </span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${printModalJob.printType?.toLowerCase().includes('color') ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'}`}>
                  {printModalJob.printType} Print
                </span>
              </div>
              
              <div className="flex gap-3">
                <button onClick={() => closePrintFrame(false)} className="px-5 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
                  Cancel
                </button>

                <button 
                  onClick={executeWindowPrint} 
                  className={`px-8 py-3 rounded-xl font-black text-white transition flex items-center justify-center gap-2 shadow-lg ${kioskMode ? 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'}`}
                >
                  {kioskMode ? <Zap className="w-5 h-5" /> : <Printer className="w-5 h-5" />}
                  {kioskMode ? 'Auto-Printing...' : 'Print Now'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🚀 IMAGE EDITOR MODAL */}
      {editingImageUrl && (
        <ImageEditorModal 
          imageUrl={editingImageUrl}
          onClose={() => {
            setEditingImageUrl(null);
            setEditingJobField(null);
            setEditingJobId(null);
          }}
          onSave={(newCroppedUrl) => {
            // Queue me job ko update karo naye cropped URL ke sath
            setPrintQueue(prevQueue => prevQueue.map(job => {
              if (job._id === editingJobId) {
                return { ...job, [editingJobField]: newCroppedUrl };
              }
              return job;
            }));
            
            // Modal close karo
            setEditingImageUrl(null);
            setEditingJobField(null);
            setEditingJobId(null);
            toast.success("Image cropped successfully! Now you can print.");
          }}
        />
      )}

    </div>
  );
}