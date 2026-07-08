import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy — Split",
  description: "Refund Policy for Split — Institutional Payment Routing Platform by Cybortex Technologies.",
};

export default function RefundPolicy() {
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
            Refund Policy
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
            <h2 className="text-xl font-semibold text-primary mb-3">1. Overview</h2>
            <p>
              This Refund Policy governs the processing of refunds for payments made through Split (&ldquo;the Service&rdquo;), operated by <strong>Cybortex Technologies</strong>. Because Split is a routing platform that distributes payments to multiple institutional wallets, refund requests are subject to the policies of the respective institution and the applicable payment processor.
            </p>
            <p className="mt-3">
              This policy applies to all users who make or receive payments through the Service.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">2. General Refund Principles</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Split acts as a payment routing intermediary. Once a payment is processed, funds are distributed to the designated institutional wallets.</li>
              <li>Refund requests must be initiated by the institution or the relevant administrative body (e.g., Finance Department).</li>
              <li>Individual students or payers should contact their institution&apos;s finance office to request a refund.</li>
              <li>Split will facilitate refunds as instructed by the institution, subject to available wallet balances and processing capabilities.</li>
            </ul>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">3. When Refunds May Be Issued</h2>
            <p>Refunds may be considered in the following circumstances:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Duplicate Payment:</strong> A student accidentally pays the same fee twice.</li>
              <li><strong>Overpayment:</strong> A student pays more than the required amount due to a system or user error.</li>
              <li><strong>Incorrect Allocation:</strong> Funds were routed to the wrong wallet due to an error in the fee configuration.</li>
              <li><strong>Withdrawal of Enrollment:</strong> A student withdraws from the institution within the institution&apos;s refund window.</li>
              <li><strong>Service Error:</strong> A technical error on Split&apos;s side results in an incorrect charge or routing.</li>
            </ul>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">4. Refund Process</h2>
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li>
                <strong>Student submits request:</strong> The student contacts their institution&apos;s finance department with payment details (transaction reference, amount, date, reason for refund).
              </li>
              <li>
                <strong>Institution reviews and approves:</strong> The institution&apos;s finance team verifies the request and approves it through their internal refund process.
              </li>
              <li>
                <strong>Institution initiates refund on Split:</strong> An authorized administrator initiates the refund request through the Split dashboard, specifying the amount and wallet(s) to deduct from.
              </li>
              <li>
                <strong>Split processes refund:</strong> Split processes the refund through the payment processor (Nomba). Refunds are sent to the original payment method used.
              </li>
              <li>
                <strong>Confirmation:</strong> Both the institution and the student receive confirmation of the refund processing.
              </li>
            </ol>
            <p className="mt-3">
              <strong>Note:</strong> Processing times depend on the payment processor and the institution&apos;s bank. Typically, refunds are processed within 5–10 business days.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">5. Service Fees and Processing Charges</h2>
            <p>
              Any transaction fees charged by the payment processor (Nomba) for the original payment are generally non-refundable. Split&apos;s platform fees, if applicable, will be deducted from the refund amount or retained as outlined in the institution&apos;s service agreement.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">6. Non-Refundable Items</h2>
            <p>The following are generally non-refundable:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Payment processing fees charged by third-party processors</li>
              <li>Platform subscription fees (if applicable) for billing periods already used</li>
              <li>Donations or voluntary contributions clearly marked as non-refundable</li>
              <li>Payments processed more than 180 days prior to the refund request</li>
            </ul>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">7. Dispute Resolution</h2>
            <p>
              If a refund request is denied by the institution or if there is a disagreement about the refund amount, the payer should first escalate the issue within the institution. If the issue remains unresolved, the payer may contact <strong>Cybortex Technologies</strong> at{" "}
              <a href="mailto:info@cybortex.tech" className="text-gold hover:text-gold-royal transition-colors">info@cybortex.tech</a>{" "}
              for mediation assistance.
            </p>
            <p className="mt-3">
              We will make reasonable efforts to assist in resolving disputes but ultimately the refund decision rests with the institution that received the payment.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">8. Chargebacks</h2>
            <p>
              If a payer initiates a chargeback with their bank or card issuer, the chargeback will be handled according to the payment processor&apos;s (Nomba) policies. We reserve the right to dispute chargebacks where appropriate, and the institution may be charged a chargeback fee as determined by the payment processor.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Refund Policy from time to time. Changes will be effective immediately upon posting. Your continued use of the Service after changes constitutes acceptance of the revised policy.
            </p>
          </div>

          <hr className="border-border-subtle" />

          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">10. Contact Us</h2>
            <p>
              If you have questions about this Refund Policy or need assistance with a refund, please reach out:
            </p>
            <div className="mt-3 p-4 rounded-xl bg-surface-secondary border border-border space-y-1">
              <p><strong className="text-primary">Email:</strong>{" "}
                <a href="mailto:info@cybortex.tech" className="text-gold hover:text-gold-royal transition-colors">info@cybortex.tech</a>
              </p>
              <p><strong className="text-primary">Phone:</strong>{" "}
                <a href="tel:+2349071649725" className="text-gold hover:text-gold-royal transition-colors">+234 907 164 9725</a>
              </p>
              <p><strong className="text-primary">Developer:</strong> Cybortex Technologies</p>
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
