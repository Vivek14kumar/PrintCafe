"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Mail, Phone, Store, Save, RefreshCw, Briefcase, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  const [profile, setProfile] = useState({
    ownerName: '',
    email: '',
    phone: '',
    shopName: '',
    businessType: 'Cyber Cafe'
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        
        if (data.success) {
          setProfile({
            ownerName: data.profile.ownerName || '',
            email: data.profile.email || '',
            phone: data.profile.phone || '',
            shopName: data.profile.shopName || '',
            businessType: data.profile.businessType || 'Cyber Cafe'
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setPageLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchProfileData();
    }
  }, [status]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      
      if(data.success) {
        alert("Profile Updated Successfully!");
      } else {
        alert(data.message);
      }
    } catch(error) {
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="bg-white p-4 rounded-full shadow-lg mb-4">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <p className="text-gray-500 font-bold tracking-wide uppercase text-sm">Loading Identity...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      
      {/* Header Section */}
      <header className="mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Identity</h2>
        <p className="text-gray-500 font-medium mt-1">Manage your personal information and business profile.</p>
      </header>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        
        {/* Cover Photo & Avatar Area */}
        <div className="relative h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          <div className="absolute inset-0 bg-black/10"></div>
          {/* Badge */}
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/30 shadow-sm">
            <ShieldCheck className="w-4 h-4" /> Verified Partner
          </div>
        </div>
        
        <div className="px-8 pb-8 relative">
          {/* Overlapping Avatar */}
          <div className="absolute -top-16 left-8">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white overflow-hidden">
              <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600">
                <User className="w-16 h-16" />
              </div>
            </div>
          </div>

          <div className="pt-20">
            <h1 className="text-2xl font-black text-gray-900">{profile.ownerName || "Awesome Partner"}</h1>
            <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
              <Store className="w-4 h-4" /> {profile.shopName || "Print Shop"}
            </p>
          </div>

          <form onSubmit={handleSave} className="mt-12 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* --- Personal Details Column --- */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User className="w-5 h-5" /></div>
                  <h3 className="font-bold text-gray-900 text-lg">Personal Details</h3>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Owner Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <input type="text" name="ownerName" value={profile.ownerName} onChange={handleChange} placeholder="Enter your name" className="pl-11 w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-gray-800" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Registered Email <span className="text-xs font-normal text-gray-400">(Cannot be changed)</span></label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                      <input type="email" value={profile.email} readOnly className="pl-11 w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-gray-500 cursor-not-allowed outline-none font-medium" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">WhatsApp / Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <input type="tel" name="phone" value={profile.phone} onChange={handleChange} maxLength="10" placeholder="10-digit mobile number" className="pl-11 w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-gray-800" />
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Business Details Column --- */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Briefcase className="w-5 h-5" /></div>
                  <h3 className="font-bold text-gray-900 text-lg">Business Identity</h3>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Cafe / Shop Name</label>
                    <div className="relative group">
                      <Store className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input type="text" name="shopName" value={profile.shopName} onChange={handleChange} placeholder="e.g. Digital Sahayata Kendra" className="pl-11 w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-gray-800" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Business Category</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                      <select name="businessType" value={profile.businessType} onChange={handleChange} className="pl-11 w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-gray-800 appearance-none">
                        <option>Cyber Cafe</option>
                        <option>CSC (Common Service Centre)</option>
                        <option>Vasudha Kendra</option>
                        <option>Stationery & Print Shop</option>
                        <option>Internet Cafe</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Save Action */}
            <div className="pt-8 mt-4 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={loading} 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-10 rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-70 transform hover:-translate-y-0.5"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
                {loading ? "Updating Profile..." : "Save Changes"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}