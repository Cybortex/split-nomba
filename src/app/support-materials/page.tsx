"use client";

import React from "react";
import { ShieldCheck, Server, Layers, Key, Zap, CheckCircle2, FileText, Lock, Rocket, Activity } from "lucide-react";

export default function SupportMaterials() {
  const faqs = [
    {
      q: "What is Split and what problem does it solve?",
      a: "Split is a role-based, consensus-driven fee collection and disbursement platform designed for Nigerian tertiary institutions. It solves the fragmented collection of tuition, faculty, and departmental dues by providing a single payment point. Crucially, it brings transparency to institutional finances by ensuring funds are automatically split into appropriate virtual accounts and cannot be withdrawn without a strict approval chain."
    },
    {
      q: "How does the automated fee splitting work?",
      a: "When an institution is configured, administrators define fee schedules for different student levels (e.g., Tuition, SUG Dues, Faculty Dues, Department Dues). When a student pays, Nomba processes the single transaction, and our backend instantly calculates the split according to the schedule. It then virtually allocates the exact amounts to the respective dedicated virtual accounts tied to each association or faculty."
    },
    {
      q: "What is the Withdrawal Consensus Mechanism?",
      a: "To prevent fund mismanagement, no single person can withdraw funds. For departmental or faculty funds, a Student Executive must initiate a withdrawal request specifying the amount and reason. This request enters a 'Pending' state and requires explicit approval from an assigned Staff Advisor. Only after advisor approval can the Institution Finance Officer execute the actual disbursement."
    },
    {
      q: "Can a Dean or HOD withdraw funds directly?",
      a: "No. Deans and HODs have oversight and management capabilities (such as assigning the Staff Advisor), but the system enforcing strict separation of concerns means they cannot initiate or approve direct disbursements. They can monitor the financial health and transaction history of their respective domains."
    },
    {
      q: "How are roles independent of each other?",
      a: "In Split, structural roles (Dean, HOD) are completely decoupled from association roles (Staff Advisor, Student Exco). This means if an institution changes a Dean, the Staff Advisor managing the faculty's funds remains intact unless explicitly changed by the new Dean. This guarantees continuity and prevents accidental exposure of funds during administrative transitions."
    },
    {
      q: "What happens if a webhook event is missed?",
      a: "Our system relies on real-time webhook events from Nomba to confirm transaction completion. However, we also implement idempotency checks based on transaction references to ensure that even if a webhook is retried or delivered late, no student is credited twice and no wallet balance is falsely inflated."
    },
    {
      q: "Does this support Federal Universities using the Treasury Single Account (TSA)?",
      a: "For the scope of this Nomba Hackathon project, we assume a Private or State institution model where tuition and dues go to commercial bank accounts perfectly suited for Nomba. In a real-world Federal University deployment, the platform would adopt a hybrid architecture: tuition payments would generate an RRR via Remita to sweep directly into the TSA, while faculty and departmental dues would continue to be processed and split seamlessly through Nomba into their respective commercial union accounts."
    }
  ];

  return (
    <div className="min-h-screen bg-app pb-16 sm:pb-24 text-secondary">
      {/* Hero Section */}
      <div className="bg-surface border-b border-border-subtle pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
            Project Documentation <span className="text-gold">&</span> Support
          </h1>
          <p className="text-lg md:text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
            A comprehensive overview of the Split platform, detailing our architecture, security protocols, technical decisions, and operational workflow for the Nomba Hackathon.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 space-y-16 sm:space-y-24">
        
        {/* Section: Pitch Deck Presentation */}
        <section>
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 flex items-center justify-center sm:justify-start gap-3">
              <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
              Official Pitch Deck
            </h2>
            <p className="text-lg leading-relaxed">
              Explore our comprehensive slide deck outlining the vision, execution, and technical impact of the Split platform.
            </p>
          </div>
          <div className="card p-2 sm:p-4 bg-surface border border-border-subtle rounded-xl shadow-xl overflow-hidden">
            <iframe 
              src="/Pitchdeck.pdf#toolbar=0" 
              className="w-full h-[600px] sm:h-[800px] rounded-lg border-0"
              title="Split Platform Pitch Deck"
            />
          </div>
        </section>

        {/* Section: What Split Does & How It Works */}
        <section>
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 flex items-center justify-center sm:justify-start gap-3">
              <Layers className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
              What Split Does & Implementation
            </h2>
            <p className="text-lg leading-relaxed">
              Split tackles the financial opacity prevalent in university ecosystems by providing a centralized platform for both fee collection and fund disbursement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-6 sm:p-8">
              <h3 className="text-xl font-bold text-primary mb-4">Unified Collection</h3>
              <p className="leading-relaxed mb-4">
                Instead of students paying tuition on one portal, faculty dues to a POS vendor, and SUG dues to a bank teller, Split unifies these into a single checkout flow powered by Nomba.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <span>Dynamic fee calculation based on student level and department.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <span>Real-time generation of downloadable PDF receipts.</span>
                </li>
              </ul>
            </div>

            <div className="card p-6 sm:p-8">
              <h3 className="text-xl font-bold text-primary mb-4">Role-Based Governance</h3>
              <p className="leading-relaxed mb-4">
                Funds are immediately split into dedicated sub-wallets. The system implements a strict governance model to manage these funds securely.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <span><strong>Student Excos</strong> can initiate withdrawal requests.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <span><strong>Staff Advisors</strong> must review and approve requests.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <span><strong>Finance Officers</strong> execute the final disbursement.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section: Project Timeline & Integrations */}
        <section>
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 flex items-center justify-center sm:justify-start gap-3">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
              Development Timeline & Integrations
            </h2>
            <p className="text-lg leading-relaxed">
              An overview of the core features and integrations we successfully built for the Nomba Hackathon.
            </p>
          </div>

          <div className="relative border-l-2 border-border-subtle ml-4 sm:ml-6 space-y-10 py-4">
            <div className="relative pl-8 sm:pl-10">
              <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-gold border-4 border-surface shadow"></div>
              <h3 className="text-xl font-bold text-primary mb-2">1. Role-Based Authentication & Setup</h3>
              <p className="leading-relaxed mb-2">Developed a comprehensive 9-tier role system allowing precise access control for Deans, HODs, Finance Officers, Advisors, and Students.</p>
              <div className="inline-block bg-surface px-3 py-1 rounded-full text-xs font-semibold text-gold border border-border-subtle">Integration: Clerk Auth</div>
            </div>

            <div className="relative pl-8 sm:pl-10">
              <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-gold border-4 border-surface shadow"></div>
              <h3 className="text-xl font-bold text-primary mb-2">2. Automated Virtual Wallet Provisioning</h3>
              <p className="leading-relaxed mb-2">Built dynamic wallet creation mapping directly to university faculties, departments, and associations using Wema Bank virtual accounts.</p>
              <div className="inline-block bg-surface px-3 py-1 rounded-full text-xs font-semibold text-gold border border-border-subtle">Integration: Convex DB</div>
            </div>

            <div className="relative pl-8 sm:pl-10">
              <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-gold border-4 border-surface shadow"></div>
              <h3 className="text-xl font-bold text-primary mb-2">3. Dynamic Fee Splitting Engine</h3>
              <p className="leading-relaxed mb-2">Engineered a flexible algorithm that calculates the exact required dues and tuition fractions instantly based on a student's department and level.</p>
              <div className="inline-block bg-surface px-3 py-1 rounded-full text-xs font-semibold text-gold border border-border-subtle">Internal Logic</div>
            </div>

            <div className="relative pl-8 sm:pl-10">
              <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-gold border-4 border-surface shadow"></div>
              <h3 className="text-xl font-bold text-primary mb-2">4. Payment Gateway & Webhook Sync</h3>
              <p className="leading-relaxed mb-2">Integrated seamless checkout experiences and secure backend webhooks with cryptographic HMAC verification to finalize split transactions.</p>
              <div className="inline-block bg-surface px-3 py-1 rounded-full text-xs font-semibold text-gold border border-border-subtle">Integration: Nomba API</div>
            </div>

            <div className="relative pl-8 sm:pl-10">
              <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-gold border-4 border-surface shadow"></div>
              <h3 className="text-xl font-bold text-primary mb-2">5. Multi-Signature Withdrawal Consensus</h3>
              <p className="leading-relaxed mb-2">Implemented a strict approval pipeline where Student Excos initiate and Staff Advisors approve requests before Finance Officers can disburse funds.</p>
              <div className="inline-block bg-surface px-3 py-1 rounded-full text-xs font-semibold text-gold border border-border-subtle">Integration: Convex Real-time</div>
            </div>
          </div>
        </section>

        {/* Section: Tech Stack */}
        <section>
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 flex items-center justify-center sm:justify-start gap-3">
              <Server className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
              Technology Stack
            </h2>
            <p className="text-lg leading-relaxed">
              Our stack was chosen to prioritize real-time data sync, secure authentication, and seamless payment infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-5 sm:p-6">
              <h3 className="font-bold text-primary mb-2 text-lg">Next.js</h3>
              <p className="text-sm leading-relaxed">
                Chosen for its robust App Router, server-side rendering capabilities, and seamless integration with our backend. It allows us to deliver a fast, SEO-friendly, and highly responsive user interface.
              </p>
            </div>
            <div className="card p-5 sm:p-6">
              <h3 className="font-bold text-primary mb-2 text-lg">Convex</h3>
              <p className="text-sm leading-relaxed">
                Acts as our real-time database and serverless backend. We chose Convex because it automatically pushes state updates to the UI, ensuring that when an advisor approves a request, the finance dashboard updates instantly without polling.
              </p>
            </div>
            <div className="card p-5 sm:p-6">
              <h3 className="font-bold text-primary mb-2 text-lg">Clerk</h3>
              <p className="text-sm leading-relaxed">
                Manages our complex 9-tier role-based authentication system. We chose Clerk to offload session management and ensure that user identities and permissions are securely maintained across devices.
              </p>
            </div>
            <div className="card p-5 sm:p-6">
              <h3 className="font-bold text-primary mb-2 text-lg">Nomba</h3>
              <p className="text-sm leading-relaxed">
                We utilized Nomba's payment gateway and API to generate dedicated virtual accounts for every entity. This integration handles the heavy lifting of payment processing and webhooks securely.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Security Measures */}
        <section>
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 flex items-center justify-center sm:justify-start gap-3">
              <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
              Security Measures
            </h2>
          </div>

          <div className="card p-6 sm:p-8 space-y-6">
            <div className="flex gap-4">
              <Lock className="w-6 h-6 text-gold shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-primary text-lg mb-1">Webhook Signature Verification (HMAC)</h4>
                <p className="leading-relaxed">
                  To prevent spoofing or unauthorized ledger updates, all incoming webhooks from Nomba are verified using cryptographic HMAC signatures (`X-Nomba-Signature`). The system rejects any payload that was not genuinely signed by Nomba's servers.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Key className="w-6 h-6 text-gold shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-primary text-lg mb-1">Strict Role Isolation</h4>
                <p className="leading-relaxed">
                  Data access is strictly compartmentalized. A Dean can only view their specific faculty's wallet; a student can only view their own receipts. Our backend queries enforce these permission checks before returning any data.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <FileText className="w-6 h-6 text-gold shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-primary text-lg mb-1">Immutable Audit Trails</h4>
                <p className="leading-relaxed">
                  Every significant action—whether assigning a new staff advisor, initiating a payment, or approving a withdrawal—is permanently logged in an Audit database with a timestamp and the acting user's ID to ensure total accountability.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Zap className="w-6 h-6 text-gold shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-primary text-lg mb-1">Idempotent Transactions</h4>
                <p className="leading-relaxed">
                  Our webhook processor checks transaction references against the database before applying balances. This guarantees that duplicate webhook deliveries will never result in double-crediting a wallet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Future Roadmap */}
        <section>
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 flex items-center justify-center sm:justify-start gap-3">
              <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
              Future Development Plans
            </h2>
            <p className="text-lg leading-relaxed">
              We have a clear vision for how Split can evolve beyond this hackathon MVP into a comprehensive financial ecosystem for tertiary institutions.
            </p>
          </div>

          <div className="space-y-6">
            <div className="card p-6 border-l-4 border-gold">
              <h4 className="text-lg font-bold text-primary mb-2">Biometric & Multi-Factor Authentication</h4>
              <p className="leading-relaxed">Implement step-up security verification (such as fingerprint scanning, face unlock, or SMS/email OTPs) for executing high-volume or critical withdrawals.</p>
            </div>
            
            <div className="card p-6 border-l-4 border-gold">
              <h4 className="text-lg font-bold text-primary mb-2">AI Smart Analytics</h4>
              <p className="leading-relaxed">Integrate predictive analytics and AI forecasting models to assist school deans, HODs, and finance officers in predicting fee compliance rates and preparing departmental budgets.</p>
            </div>

            <div className="card p-6 border-l-4 border-gold">
              <h4 className="text-lg font-bold text-primary mb-2">Course Representative Fee Collection Portal</h4>
              <p className="leading-relaxed">Design a delegated collection channel enabling class/course representatives to securely collect physical dues or track local department micro-payments on behalf of their peers.</p>
            </div>

            <div className="card p-6 border-l-4 border-gold">
              <h4 className="text-lg font-bold text-primary mb-2">Institutional Crowdfunding Platform</h4>
              <p className="leading-relaxed">Introduce crowdfunding features allowing associations, departments, or faculties to raise money for specific school projects, laboratories, or SUG events.</p>
            </div>

            <div className="card p-6 border-l-4 border-gold">
              <h4 className="text-lg font-bold text-primary mb-2">Personal Student & Staff Mobile Banking App</h4>
              <p className="leading-relaxed">Develop a lightweight, dedicated mobile application for students and staff to receive allowances, manage micro-payments, and monitor association fund transparency on the go.</p>
            </div>
          </div>
        </section>

        {/* Section: Detailed FAQ */}
        <section>
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="card p-6">
                <h4 className="text-lg font-bold text-primary mb-3">{faq.q}</h4>
                <p className="leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
