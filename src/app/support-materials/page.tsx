"use client";

import React from "react";
import { Download, PlayCircle, Code, ShieldCheck, Map, Smartphone, MessageSquare, Layout } from "lucide-react";
import Link from "next/link";

export default function SupportMaterials() {
  const materials = [
    {
      title: "Pitch Deck (12 Slides)",
      description: "Comprehensive 12-slide presentation covering the problem, market opportunity, solution, business model, and GTM strategy.",
      icon: <Layout className="w-6 h-6 text-gold" />,
      action: "View Outline",
    },
    {
      title: "Demo Video",
      description: "A 3-minute screen capture walkthrough showing the full lifecycle of a transaction from student payment to finance execution.",
      icon: <PlayCircle className="w-6 h-6 text-info" />,
      action: "Watch Video",
    },
    {
      title: "System Architecture",
      description: "Diagram showing Next.js + Clerk + Convex + Nomba API + Providus Bank integration.",
      icon: <Code className="w-6 h-6 text-success" />,
      action: "View Diagram",
    },
    {
      title: "Security & Compliance Note",
      description: "1-page document detailing HMAC webhook verification, role-based access control, and audit logs.",
      icon: <ShieldCheck className="w-6 h-6 text-warning" />,
      action: "Read Document",
    },
    {
      title: "User Journey Maps",
      description: "Visual flows of the Student Payment Journey and the Withdrawal Consensus Journey.",
      icon: <Map className="w-6 h-6 text-primary" />,
      action: "View Maps",
    },
    {
      title: "Mobile Mockups",
      description: "Premium visual presentations of the Split dashboard wrapped in mobile frames.",
      icon: <Smartphone className="w-6 h-6 text-secondary" />,
      action: "View Mockups",
    },
    {
      title: "Financial Model",
      description: "Spreadsheet showing Year 1-3 projections, SaaS revenue, and transaction fee splits.",
      icon: <Download className="w-6 h-6 text-success" />,
      action: "Download Sheet",
    },
    {
      title: "Live Demo Credentials",
      description: "A shareable list of 27 seeded accounts for judges to test all 9 roles.",
      icon: <MessageSquare className="w-6 h-6 text-info" />,
      action: "Get Credentials",
    }
  ];

  return (
    <div className="min-h-screen bg-app pb-20">
      {/* Hero Section */}
      <div className="bg-surface border-b border-border-subtle pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
            Support Materials for <span className="text-gold">Split</span>
          </h1>
          <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
            Everything you need to pitch, submit, and demonstrate the Split platform for the Nomba Hackathon. 
            All resources are designed to highlight our robust consensus mechanism and real-time fee splitting.
          </p>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="max-w-6xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {materials.map((item, index) => (
            <div 
              key={index} 
              className="p-6 rounded-2xl bg-surface-secondary border border-border hover:border-gold/30 transition-all duration-300 flex flex-col h-full group"
            >
              <div className="w-12 h-12 rounded-xl bg-app border border-border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
              <p className="text-sm text-secondary leading-relaxed mb-6 flex-grow">
                {item.description}
              </p>
              <button className="w-full py-2.5 rounded-lg bg-surface border border-border text-sm font-semibold text-primary hover:bg-hover transition-colors">
                {item.action}
              </button>
            </div>
          ))}
        </div>

        {/* Action Call */}
        <div className="mt-16 p-8 rounded-2xl bg-gold/5 border border-gold/20 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-primary mb-4">Ready for Submission?</h2>
          <p className="text-secondary mb-6">
            Ensure your GitHub README is updated, your Demo Video is uploaded, and you have provided the live URL.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/"
              className="px-6 py-3 rounded-xl bg-surface border border-border text-sm font-bold text-primary hover:bg-hover transition-colors"
            >
              Back to Home
            </Link>
            <button className="px-6 py-3 rounded-xl bg-gold text-black text-sm font-bold hover:brightness-110 transition-all">
              Download Submission Pack (.zip)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
