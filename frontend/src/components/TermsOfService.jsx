import React from 'react';

function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-purple py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center text-nfl-blue mb-6">Terms of Service</h1>
          <div className="space-y-6 text-gray-700">
            <p>
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Football Eliminator service, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">2. Description of Service</h2>
              <p>
                Football Eliminator provides a platform for users to participate in football elimination pools. The service includes features for pool management, pick submissions, and result tracking.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">3. User Accounts</h2>
              <p>
                You must create an account to use certain features of the service. You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">4. User Conduct</h2>
              <p>
                You agree not to use the service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. You must not attempt to gain unauthorized access to any part of the service or any system or network connected to the service.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">5. Payment and Refunds</h2>
              <p>
                Certain aspects of the service may require payment. All payments are non-refundable unless otherwise stated. We reserve the right to change our pricing at any time.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">6. Intellectual Property</h2>
              <p>
                The service and its original content, features, and functionality are owned by Football Eliminator and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">7. Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">8. Limitation of Liability</h2>
              <p>
                In no event shall Football Eliminator, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">9. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-nfl-blue mb-2">10. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
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

export default TermsOfService;