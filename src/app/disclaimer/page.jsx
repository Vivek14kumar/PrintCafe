import React from 'react';

export default function Disclaimer() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-black text-gray-900 mb-6">Legal Disclaimer</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: June 2026</p>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">1. No Liability for Uploaded Content</h2>
          <p>PrintCafe acts solely as a technological intermediary (SaaS software) providing a platform for managing print queues. <strong>We do not monitor, review, or endorse the content, documents, or ID cards uploaded by end-users or printed by the Cafe Operators.</strong></p>
          <p className="mt-2">The Cafe Operator is solely responsible for verifying the legality, authenticity, and copyright status of any document before printing it. PrintCafe shall not be held liable for the printing of any fake, forged, illegal, or copyrighted materials by any user or operator.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">2. Hardware and Business Loss</h2>
          <p>PrintCafe is not responsible for any hardware failures (e.g., printer jams, ink depletion, computer crashes) that may occur while using our software. Furthermore, PrintCafe will not be liable for any direct, indirect, or consequential loss of business, revenue, or data resulting from platform downtime or server errors.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">3. End-Customer Disputes</h2>
          <p>Any dispute regarding the quality of the physical print, the amount charged by the Cyber Cafe to their end-customer, or cash/UPI transaction failures between the customer and the Cafe Operator is strictly between those two parties. PrintCafe is not a party to these transactions and bears no responsibility for resolving such disputes.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">4. Indemnification</h2>
          <p>By using PrintCafe, all Cafe/CSC operators agree to indemnify and hold harmless PrintCafe, its founders, and employees from any claims, damages, lawsuits, or legal actions arising out of their misuse of the platform or printing of unauthorized documents.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">5. "As-Is" Basis</h2>
          <p>The PrintCafe services are provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied, including but not limited to warranties of uninterrupted service or error-free operation.</p>
        </section>
      </div>
    </div>
  );
}