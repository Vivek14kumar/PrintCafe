import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 via-indigo-700 to-violet-800 mb-6 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Have questions, payment issues, or need support with <span className="font-semibold text-indigo-900">PrintCafe</span>? Our team is here to help you out seamlessly.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Left Column: Support Details Card (Takes up 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden h-full">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-full blur-2xl opacity-70"></div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-8 relative z-10">Contact Information</h2>
              
              <div className="space-y-8 relative z-10">
                {/* Email Info */}
                <div className="flex items-start gap-5 group">
                  <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Email Support</p>
                    <p className="text-slate-900 font-semibold text-lg">viktechzweb@gmail.com</p>
                    <p className="text-sm text-slate-500 mt-1">We typically reply within 24 hours.</p>
                  </div>
                </div>

                {/* Phone Info */}
                <div className="flex items-start gap-5 group">
                  <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Phone / WhatsApp</p>
                    <p className="text-slate-900 font-semibold text-lg">+91-8676880507</p>
                    <p className="text-sm text-slate-500 mt-1">Mon - Sat, 10:00 AM to 6:00 PM</p>
                  </div>
                </div>

                {/* Location Info 
                <div className="flex items-start gap-5 group">
                  <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Office Location</p>
                    <p className="text-slate-900 font-semibold text-lg">PrintCafe HQ</p>
                    <p className="text-sm text-slate-500 mt-1">Your City, State, ZIP Code</p>
                  </div>
                </div>*/}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form (Takes up 3 columns on large screens) */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-8 md:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Input */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="John Doe"
                  />
                </div>
                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
                  <input 
                    type="email" 
                    id="email"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-semibold text-slate-700">Subject</label>
                <input 
                  type="text" 
                  id="subject"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="How can we help you?"
                />
              </div>

              {/* Message Textarea */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-semibold text-slate-700">Message</label>
                <textarea 
                  id="message"
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Write your message here..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <button 
                type="button" 
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}