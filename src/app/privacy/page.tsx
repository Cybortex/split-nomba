import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Split",
  description: "Privacy Policy for Split — Institutional Payment Routing Platform by Cybortex Technologies.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-10 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-border bg-gold-soft text-gold-royal animate-fade-in">
            Policies
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-primary">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-dark">
            Last updated: July 8, 2026
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <div className="card p-6 sm:p-10 space-y-8 text-sm sm:text-base leading-relaxed text-secondary">

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">1. Introduction</h2>
            <p>
              Split (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our institutional payment routing platform and related services (collectively, the &ldquo;Service&rdquo;).
            </p>
            <p className="mt-3">
              By accessing or using the Service, you agree to the terms of this Privacy Policy. If you do not agree, please do not use the Service.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">2. Information We Collect</h2>
            <h3 className="text-base font-medium text-primary mb-2">Personal Information</h3>
            <p>We may collect personally identifiable information such as:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Full name, email address, phone number</li>
              <li>Institution name, role, and department</li>
              <li>Student identification details (e.g., matriculation number)</li>
              <li>Payment and transaction history</li>
              <li>Account credentials (managed securely via Clerk)</li>
            </ul>

            <h3 className="text-base font-medium text-primary mt-5 mb-2">Usage Data</h3>
            <p>We automatically collect certain information when you visit or use the Service, including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>IP address, browser type, and operating system</li>
              <li>Pages visited, time spent, and interaction patterns</li>
              <li>Device identifiers and diagnostic data</li>
            </ul>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To provide, operate, and maintain the Service</li>
              <li>To process and route payments to designated institutional wallets</li>
              <li>To authenticate users and authorize transactions</li>
              <li>To generate receipts, reports, and audit logs</li>
              <li>To communicate with you about your account and transactions</li>
              <li>To improve the Service and develop new features</li>
              <li>To comply with legal obligations and prevent fraud</li>
            </ul>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">4. Data Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Payment Processors:</strong> Nomba (our payment processing partner) processes payments on our behalf. They receive only the information necessary to complete transactions.</li>
              <li><strong>Authentication Providers:</strong> Clerk handles user authentication. Your credentials are managed by Clerk&apos;s secure infrastructure.</li>
              <li><strong>Service Providers:</strong> Third-party vendors who assist in operating the Service (e.g., Convex for database, Vercel for hosting).</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights.</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> sell your personal information to third parties.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">5. Data Security</h2>
            <p>
              We implement industry-standard security measures, including encryption in transit (TLS) and at rest, to protect your data. Access to sensitive information is restricted to authorized personnel only. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">6. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to provide the Service. We may retain certain information for longer periods as required by law, for audit purposes, or to resolve disputes. Transaction records are retained in accordance with applicable financial regulations.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">7. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate or incomplete data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Withdraw consent at any time (where processing is based on consent)</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at{" "}
              <a href="mailto:info@cybortex.tech" className="text-gold hover:text-gold-royal transition-colors">info@cybortex.tech</a>.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">8. Third-Party Services</h2>
            <p>
              Our Service integrates with third-party services including Clerk (authentication), Convex (database), and Nomba (payment processing). Each service has its own privacy policy governing the use of your data. We encourage you to review their policies.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page and updating the &ldquo;Last updated&rdquo; date. Continued use of the Service after changes constitutes acceptance of the revised policy.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">10. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-3 p-4 rounded-xl bg-surface-secondary border border-border space-y-1">
              <p><strong className="text-primary">Email:</strong>{" "}
                <a href="mailto:info@cybortex.tech" className="text-gold hover:text-gold-royal transition-colors">info@cybortex.tech</a>
              </p>
              <p><strong className="text-primary">Phone:</strong>{" "}
                <a href="tel:+2349071649725" className="text-gold hover:text-gold-royal transition-colors">+234 907 164 9725</a>
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Image
                  src="/CybortexLogo.png"
                  alt="Cybortex Technologies Logo"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain"
                />
                <div>
                  <p className="text-xs font-semibold text-primary">Cybortex Technologies</p>
                  <p className="text-xs text-muted-dark">Software Development &amp; Innovation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-royal transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
