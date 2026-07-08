import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Split",
  description: "Terms of Service for Split — Institutional Payment Routing Platform by Cybortex Technologies.",
};

export default function TermsOfService() {
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
            Terms of Service
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
            <h2 className="text-xl font-semibold text-primary mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Split (&ldquo;the Service&rdquo;), operated by <strong>Cybortex Technologies</strong>, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, you may not access or use the Service.
            </p>
            <p className="mt-3">
              These Terms apply to all users, including institutions, administrators, students, and any other parties who interact with the Service.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">2. Description of Service</h2>
            <p>
              Split is an institutional payment routing platform that enables students to make a single payment, which is then automatically distributed to designated institutional wallets (tuition, faculty dues, department dues, association fees, etc.). The Service includes:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Student payment processing</li>
              <li>Automated fee distribution and wallet management</li>
              <li>Role-based dashboards for finance teams, deans, HODs, and administrators</li>
              <li>Receipt generation and audit logging</li>
              <li>Institution registration and fee configuration</li>
            </ul>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">3. User Responsibilities</h2>
            <p>As a user of the Service, you agree to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Use the Service only for lawful purposes and in compliance with applicable laws</li>
              <li>Not attempt to circumvent security measures or access data you are not authorized to view</li>
              <li>Not use the Service for fraudulent or malicious activities</li>
            </ul>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">4. Institution Registration and Approval</h2>
            <p>
              Institutions must register and be approved by a Super Admin before they can use the Service. Cybortex Technologies reserves the right to reject or revoke institution access at its sole discretion, particularly if the institution fails to meet compliance or eligibility requirements.
            </p>
            <p className="mt-3">
              The registering institution represents that they have the legal authority to bind the institution to these Terms.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">5. Fees and Payments</h2>
            <p>
              The Service facilitates payment routing but does not itself charge student-facing transaction fees unless explicitly disclosed. Any fees charged by third-party payment processors (e.g., Nomba) are the responsibility of the payer and will be disclosed at the point of payment.
            </p>
            <p className="mt-3">
              Institutions may be subject to platform fees for usage of the Service. These fees, if applicable, will be communicated separately in the institution&apos;s service agreement.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">6. Intellectual Property</h2>
            <p>
              The Service, including its code, design, branding, and content, is the intellectual property of <strong>Cybortex Technologies</strong> and is protected by applicable copyright, trademark, and other intellectual property laws. You may not reproduce, modify, distribute, or create derivative works without explicit written permission.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, <strong>Cybortex Technologies</strong> shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service. This includes, but is not limited to, loss of data, financial loss, or interruption of service.
            </p>
            <p className="mt-3">
              The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, either express or implied.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">8. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless <strong>Cybortex Technologies</strong>, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising out of your use of the Service, your violation of these Terms, or your violation of any rights of a third party.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, third parties, or the Service itself.
            </p>
            <p className="mt-3">
              Upon termination, your right to use the Service will immediately cease. Provisions of these Terms that by their nature should survive termination shall survive.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">10. Changes to Terms</h2>
            <p>
              We may revise these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Service after any changes constitutes acceptance of the new Terms. We encourage you to review these Terms periodically.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Nigeria.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">12. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us:
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
