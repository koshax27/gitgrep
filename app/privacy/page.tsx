export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-slate-400 mb-8">Last updated: March 22, 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-slate-300 leading-relaxed">
              When you use GitGrep, we collect:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-2 space-y-1 ml-4">
              <li>Your GitHub or Google account information (when you sign in)</li>
              <li>Search queries you perform</li>
              <li>Feedback you submit (including email address)</li>
              <li>Usage data through Google Analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
              <li>To provide and improve our code search service</li>
              <li>To respond to your feedback and inquiries</li>
              <li>To monitor and analyze usage patterns</li>
              <li>To protect against abuse and unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Data Storage</h2>
            <p className="text-slate-300 leading-relaxed">
              Your data is stored locally in your browser and on our servers. Feedback and error reports are stored to help us improve the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
            <p className="text-slate-300 leading-relaxed">
              We use:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-2 space-y-1 ml-4">
              <li><strong>GitHub API</strong> - to search code repositories</li>
              <li><strong>Google Analytics</strong> - to understand usage (anonymized data)</li>
              <li><strong>NextAuth.js</strong> - for authentication with GitHub and Google</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p className="text-slate-300 leading-relaxed">
              You can request deletion of your data by contacting us. You can also clear your local storage at any time through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">
              For privacy concerns, email us at: <a href="mailto:privacy@gitgrep.com" className="text-blue-400 hover:underline">privacy@gitgrep.com</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-slate-500 text-sm">
          <p>© 2026 GitGrep. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};