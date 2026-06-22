import React from 'react';

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Cancellation & Refund Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: June 2026</p>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">1. Credit Purchases</h2>
          <p>All wallet recharges and credit purchases made on PrintHub are final and non-refundable to your bank account or original payment method. Please review the chosen credit pack carefully before making a payment.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">2. Failed Transactions</h2>
          <p>If your money is deducted from your bank account but the credits are not added to your PrintHub wallet, the deducted amount will automatically be refunded by your bank within 5-7 working days.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">3. Failed Print Jobs</h2>
          <p>If a print job fails due to a technical error on the PrintHub platform and a credit was deducted, the operator can report the issue via the dashboard. Upon verification, 1 Credit will be refunded back to the PrintHub wallet within 24 hours. No cash refunds will be provided.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">4. Subscription Cancellations</h2>
          <p>Monthly unlimited subscription plans can be cancelled at any time to prevent future billing. However, no partial refunds will be provided for unused days in the current billing cycle.</p>
        </section>
      </div>
    </div>
  );
}