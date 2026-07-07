"use client";

import React from "react";

interface StatCardProps {
  /** Primary label displayed above the value */
  label: string;
  /** The large numeric/text value */
  value: React.ReactNode;
  /** Optional icon element shown in a colored circle/square */
  icon?: React.ReactNode;
  /** Optional subtitle shown below the value (small muted text) */
  subtitle?: string;
  /** Tailwind text color class for the value (e.g. "text-gold", "text-success") */
  valueColor?: string;
  /** Optional className for the card wrapper */
  className?: string;
  /** Icon container variant:
   *  - "inset" (default): icon in a colored circle w-10 h-10 above the label
   *  - "top-right": icon in a square p-2 container in the top-right corner */
  iconVariant?: "inset" | "top-right";
  /** Background opacity for the icon container when iconVariant="inset" (e.g. "bg-gold/10") */
  iconBg?: string;
}

export function StatCard({
  label,
  value,
  icon,
  subtitle,
  valueColor = "text-primary",
  className = "",
  iconVariant = "inset",
  iconBg,
}: StatCardProps) {
  // Derive the icon background from valueColor if not explicitly provided
  const resolvedIconBg =
    iconBg || (iconVariant === "inset" ? valueColor.replace("text-", "bg-") + "/10" : "");

  return (
    <div className={`card p-5 ${className}`}>
      {icon && iconVariant === "inset" && (
        <div
          className={`w-10 h-10 rounded-xl ${resolvedIconBg} flex items-center justify-center mb-3`}
        >
          {React.cloneElement(icon as React.ReactElement, {
            className: `w-5 h-5 ${valueColor}`,
          })}
        </div>
      )}

      {icon && iconVariant === "top-right" && (
        <div className="flex items-start justify-between mb-4">
          <span />
          <span className="flex-shrink-0 p-2 rounded-xl bg-surface-secondary">
            {React.cloneElement(icon as React.ReactElement, {
              className: `w-5 h-5 ${valueColor}`,
            })}
          </span>
        </div>
      )}

      <p className="text-sm text-muted mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      {subtitle && <p className="text-xs text-muted-dark mt-1">{subtitle}</p>}
    </div>
  );
}
