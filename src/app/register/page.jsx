"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; 
import { 
  Store, User, Phone, Lock, FileBadge, AlertTriangle, 
  Mail, CheckCircle2, Zap, TrendingUp, ShieldCheck, IndianRupee,
  Eye, EyeOff
} from 'lucide-react';

export default function CafeRegistrationPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => setIsMounted(true), []);

  const [formData, setFormData] = useState({
    ownerName: '', email: '', phone: '', shopName: '',
    businessType: 'Cyber Cafe', cscId: '', password: '', confirmPassword: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTc, setAgreedToTc] = useState(false);
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Validate fields on blur or submit
  const validateField = (name, value) => {
    let errorMsg = '';
    
    if (!value && name !== 'cscId') {
      errorMsg = 'This field cannot be blank.';
    } else if (name === 'phone' && !/^[6-9]\d{9}$/.test(value)) {
      errorMsg = 'Must be 10 digits.';
    } else if (name === 'password') {
      // Regex for at least 1 uppercase, 1 lowercase, 1 number, 1 special char, 6-8 length
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,8}$/;
      if (!passwordRegex.test(value)) {
        errorMsg = 'Must be 6-8 chars with uppercase, lowercase, number & special char (e.g., Abc@123).';
      }
    } else if (name === 'confirmPassword' && value !== formData.password) {
      errorMsg = 'Passwords do not match.';
    }

    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
  };

  const handleChange = (e) => {
  let { name, value } = e.target;

  // Agar phone field hai, toh real-time formatting apply karein
  if (name === 'phone') {
    // 1. Pehle saare non-numbers (letters/symbols) hata dein
    value = value.replace(/\D/g, '');
    
    // 2. Fir starting mein agar 0-5 hai, toh usko hata dein
    value = value.replace(/^[0-5]+/, '');
  }

  setFormData({ ...formData, [name]: value });
  
  // Clear error as user types
  if (fieldErrors[name]) {
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  }
};

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    // Validate all fields before submission
    let hasErrors = false;
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const msg = validateField(key, formData[key]);
      if (msg) {
        newErrors[key] = msg;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setError("Please fix the highlighted errors.");
      return;
    }

    if (!agreedToTc || !isBusinessOwner) return setError("Please accept declarations.");
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Account created! Redirecting...");
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans text-slate-900 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* --- Premium Background Designs --- */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }}></div>

      {/* --- Main Unified Card --- */}
      <div className={`w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col lg:flex-row overflow-hidden relative z-10 transition-all duration-700 ease-out border border-slate-100 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        
        {/* LEFT PANEL: Benefits & Branding */}
        <div className="lg:w-2/5 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 lg:p-12 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/30">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">PrintCafe</span>
            </Link>

            <h2 className="text-3xl font-extrabold tracking-tight leading-tight mb-4 text-white">
              Smarter Printing.<br/>Higher Profits.
            </h2>
            <p className="text-blue-200 text-sm font-medium mb-10 leading-relaxed">
              Join India's fastest-growing network of automated Cyber Cafes and CSCs.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/5 shadow-inner mt-0.5">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">3x Customer Capacity</h3>
                  <p className="text-blue-200 text-xs mt-1 leading-relaxed">Serve multiple walk-ins simultaneously without touching your PC.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/5 shadow-inner mt-0.5">
                  <IndianRupee className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">0% Commission UPI</h3>
                  <p className="text-blue-200 text-xs mt-1 leading-relaxed">Payments land directly in your bank account. No wallet deductions.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/5 shadow-inner mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Auto-Delete Privacy</h3>
                  <p className="text-blue-200 text-xs mt-1 leading-relaxed">Files are permanently removed post-print, building absolute customer trust.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 pt-8 border-t border-white/10 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
            <div className="text-xs font-medium text-blue-200">
              Trusted by <span className="text-white font-bold">5,000+</span> Cafes
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Registration Form */}
        <div className="lg:w-3/5 p-8 lg:p-12 bg-white flex flex-col justify-center">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Partner Account</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">B2B portal for Cafe & CSC Owners</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="mb-5 p-3.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {success}
            </div>
          )}

          <button 
            type="button" 
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:shadow-md hover:border-slate-300 transition-all duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-widest">Or register below</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} onBlur={handleBlur} className={`w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 ${fieldErrors.ownerName ? 'border-red-500' : 'border-slate-200 focus:border-transparent'}`} placeholder="Owner Name" />
                </div>
                {fieldErrors.ownerName && <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{fieldErrors.ownerName}</p>}
              </div>

              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className={`w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 ${fieldErrors.email ? 'border-red-500' : 'border-slate-200 focus:border-transparent'}`} placeholder="Email Address" />
                </div>
                {fieldErrors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{fieldErrors.email}</p>}
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input type="tel" name="phone" maxLength="10" value={formData.phone} onChange={handleChange} onBlur={handleBlur} className={`w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 ${fieldErrors.phone ? 'border-red-500' : 'border-slate-200 focus:border-transparent'}`} placeholder="WhatsApp No." />
                </div>
                {fieldErrors.phone && <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{fieldErrors.phone}</p>}
              </div>

              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Store className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} onBlur={handleBlur} className={`w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 ${fieldErrors.shopName ? 'border-red-500' : 'border-slate-200 focus:border-transparent'}`} placeholder="Shop / Cafe Name" />
                </div>
                {fieldErrors.shopName && <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{fieldErrors.shopName}</p>}
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer text-slate-700">
                <option>Cyber Cafe</option>
                <option>CSC Operator</option>
                <option>Vasudha Kendra</option>
                <option>Print Shop</option>
              </select>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FileBadge className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input type="text" name="cscId" value={formData.cscId} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400" placeholder="CSC/Reg ID (Optional)" />
              </div>
            </div>

            {/* Row 4 - Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input type={showPassword ? "text" : "password"} name="password" minLength="6" maxLength="8" value={formData.password} onChange={handleChange} onBlur={handleBlur} className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 ${fieldErrors.password ? 'border-red-500' : 'border-slate-200 focus:border-transparent'}`} placeholder="Password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{fieldErrors.password}</p>}
              </div>

              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" minLength="6" maxLength="8" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-slate-200 focus:border-transparent'}`} placeholder="Confirm Password" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{fieldErrors.confirmPassword}</p>}
              </div>
            </div>

            {/* Compact Checkboxes */}
            <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 mt-2 space-y-3">
              <label className="flex items-start cursor-pointer group">
                <input type="checkbox" required checked={isBusinessOwner} onChange={(e) => setIsBusinessOwner(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 transition-colors" />
                <span className="ml-3 text-xs text-slate-600 font-medium">
                  <strong className="text-slate-800">B2B Declaration:</strong> I operate a valid business and will use this for commercial customer prints.
                </span>
              </label>
              <label className="flex items-start cursor-pointer group">
                <input type="checkbox" required checked={agreedToTc} onChange={(e) => setAgreedToTc(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 transition-colors" />
                <span className="ml-3 text-xs text-slate-600 font-medium">
                  I accept the <a href="/terms" className="text-blue-600 font-bold hover:underline">Terms of Service</a> & Payment Policies.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={!agreedToTc || !isBusinessOwner || loading} 
              className="w-full mt-2 flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Creating Account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Already a partner?{' '}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors ml-1">
              Login here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}