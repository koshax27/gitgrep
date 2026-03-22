export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-slate-400 mb-8">Last updated: March 22, 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              By using GitGrep, you agree to these Terms of Service. If you do not agree, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
            <p className="text-slate-300 leading-relaxed">
              GitGrep provides a search engine for GitHub repositories and code snippets. We do not host any code; we only index public GitHub repositories.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
            <p className="text-slate-300 leading-relaxed">
              You agree to:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-2 space-y-1 ml-4">
              <li>Use the service for lawful purposes only</li>
              <li>Not abuse the API (rate limits apply)</li>
              <li>Not attempt to bypass security measures</li>
              <li>Not submit spam or harmful feedback</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Rate Limits</h2>
            <p className="text-slate-300 leading-relaxed">
              We impose rate limits to ensure fair usage:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-2 space-y-1 ml-4">
              <li>Search API: 20 requests per minute</li>
              <li>Feedback API: 5 submissions per minute</li>
              <li>Excessive usage may result in temporary restrictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            <p className="text-slate-300 leading-relaxed">
              Code snippets and repository data are owned by their respective authors. GitGrep does not claim ownership of any code found through our search.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              GitGrep is provided "as is" without warranties. We are not responsible for any damages arising from use of our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update these terms from time to time. Continued use of the service constitutes acceptance of updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
            <p className="text-slate-300 leading-relaxed">
              Questions? Contact us at: <a href="mailto:legal@gitgrep.com" className="text-blue-400 hover:underline">legal@gitgrep.com</a>
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