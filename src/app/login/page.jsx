"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { 
  Store, Mail, Lock, AlertTriangle, 
  Activity, IndianRupee, Printer, Eye, EyeOff 
} from 'lucide-react';

export default function CafeLoginPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => setIsMounted(true), []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for show/hide password
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Pre-submission validation for password length
    if (password.length < 6 || password.length > 8) {
      setError("Password must be between 6 and 8 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
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
        
        {/* LEFT PANEL: Dashboard Features & Branding */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-12 text-white relative overflow-hidden flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/30">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">PrintCafe</span>
            </Link>

            <h2 className="text-3xl font-extrabold tracking-tight leading-tight mb-4 text-white">
              Welcome Back.
            </h2>
            <p className="text-blue-200 text-sm font-medium mb-12 leading-relaxed">
              Log in to manage your live print queue, track earnings, and control your cafe's automation.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-7">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/5 shadow-inner mt-0.5">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Live Print Queue</h3>
                  <p className="text-blue-200 text-xs mt-1.5 leading-relaxed">Monitor customer uploads and successful prints in real-time.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/5 shadow-inner mt-0.5">
                  <IndianRupee className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Earnings Tracker</h3>
                  <p className="text-blue-200 text-xs mt-1.5 leading-relaxed">View your daily revenue and instant UPI payment settlements.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/5 shadow-inner mt-0.5">
                  <Printer className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Hardware Status</h3>
                  <p className="text-blue-200 text-xs mt-1.5 leading-relaxed">Check connection health of all your configured printers instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Login Form */}
        <div className="lg:w-3/5 p-8 lg:p-14 bg-white flex flex-col justify-center">
          
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                <Store className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Login to Dashboard</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">Access your partner portal to manage your cafe.</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Google SSO */}
          <button 
            type="button" 
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:shadow-md hover:border-slate-300 transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-widest">Or login with Email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleCredentialsLogin}>
            
            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400" 
                  placeholder="cafe@example.com" 
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  minLength={6}
                  maxLength={8}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(''); // Clear error if typing
                  }}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400" 
                  placeholder="••••••••" 
                />
                {/* Show/Hide Toggle Button */}
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 flex justify-center items-center py-4 px-4 rounded-xl shadow-[0_8px_30px_rgb(37,99,235,0.2)] text-base font-extrabold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-[0_8px_30px_rgb(37,99,235,0.4)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Signing in...
                </span>
              ) : "Login"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            New partner?{' '}
            <Link href="/register" className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors ml-1">
              Register your Cafe
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}