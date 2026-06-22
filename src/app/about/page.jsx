import React from 'react';
import { Printer, ShieldCheck, Zap } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-4">About PrintCafe</h1>
        <p className="text-lg text-gray-500">Empowering Cyber Cafes and CSCs across India with smart printing solutions.</p>
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
          <p>PrintCafe was founded with a single mission: to simplify the daily operations of Cyber Cafes, Print Shops, and Common Service Centres (CSCs). We understand the hassle of managing print queues via WhatsApp, handling physical cash, and dealing with fake UPI screenshots. Our SaaS platform digitizes and secures this entire workflow.</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <Zap className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-sm text-gray-600">Send and receive documents in seconds without compressing file quality.</p>
          </div>
          <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
            <ShieldCheck className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">100% Secure</h3>
            <p className="text-sm text-gray-600">Zero-storage policy. Documents are auto-deleted right after printing.</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
            <Printer className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Smart Queue</h3>
            <p className="text-sm text-gray-600">Manage multiple print jobs, track earnings, and verify payments in one dashboard.</p>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Who We Are</h2>
          <p>Based in Bihar, PrintCafe is built by developers who understand the ground reality of local businesses. We are continuously evolving our platform to bring enterprise-level tools to local shop owners at an affordable price.</p>
        </section>
      </div>
    </div>
  );
}