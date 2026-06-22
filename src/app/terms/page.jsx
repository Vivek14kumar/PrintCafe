import React from 'react';

export default function TermsConditions() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: June 2026</p>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">1. Acceptance of Terms</h2>
          <p>By accessing and using the PrintCafe platform, you accept and agree to be bound by the terms and provisions of this agreement.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">2. Use of Service</h2>
          <p>PrintCafe provides a SaaS platform for managing print queues. You agree to use this service only for lawful purposes. You are strictly prohibited from using the platform to print, distribute, or process illegal, offensive, or unauthorized documents.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">3. Wallet Credits</h2>
          <p>Wallet credits hold no real-world monetary value outside the PrintCafe platform and cannot be exchanged, withdrawn, or transferred to another user.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">4. Account Termination</h2>
          <p>We reserve the right to suspend or terminate your account at any time if we detect fraudulent activity, misuse of the platform, or violation of these terms.</p>
        </section>
      </div>
    </div>
  );
}