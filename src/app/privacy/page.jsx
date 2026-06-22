import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: June 2026</p>

      <div className="space-y-6 text-gray-700">
        <p>Welcome to PrintHub. We respect your privacy and are committed to protecting your personal data.</p>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">1. Data We Collect</h2>
          <p>We collect basic profile information (Name, Email, Shop Name) during registration to provide our SaaS services to Cyber Cafe and CSC operators.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">2. Document Security & Auto-Deletion (Zero-Storage Policy)</h2>
          <p>PrintHub acts purely as a conduit for print jobs. <strong>We do not permanently store any documents (PDFs, Images, ID Cards) uploaded by customers.</strong> All files are temporarily securely hosted on the cloud for printing purposes and are permanently deleted from our servers immediately after the print command is executed or rejected by the operator.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">3. Payment Information</h2>
          <p>We use highly secure, RBI-approved payment gateways (e.g., Razorpay) for processing recharges. We do not store your credit/debit card numbers or UPI PINs on our servers.</p>
        </section>
      </div>
    </div>
  );
}