import React from 'react';

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-purple py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center text-nfl-blue mb-6">Privacy Policy</h1>
          <div className="space-y-6 text-gray-700">
            <p>
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">1. Introduction</h2>
              <p>
                Welcome to Football Eliminator. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data and tell you about your privacy rights.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">2. Data We Collect</h2>
              <p>
                We may collect, use, store and transfer different kinds of personal data about you, including:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>Identity Data (e.g., first name, last name, username)</li>
                <li>Contact Data (e.g., email address, phone number)</li>
                <li>Technical Data (e.g., IP address, browser type and version)</li>
                <li>Usage Data (e.g., information about how you use our website and services)</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">3. How We Use Your Data</h2>
              <p>
                We use your data to provide and improve our services, including:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>To register you as a new customer</li>
                <li>To process and deliver your service</li>
                <li>To manage our relationship with you</li>
                <li>To improve our website, products/services, marketing, and customer relationships</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">4. Data Security</h2>
              <p>
                We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. We limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">5. Your Legal Rights</h2>
              <p>
                Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, or to object to processing.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">6. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">7. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="font-semibold mt-2">
                Email: info@footballeliminator.com<br />
                Phone: (619) 627-1629
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;