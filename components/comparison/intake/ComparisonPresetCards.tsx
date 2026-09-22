'use client';

import React from 'react';
import { ArrowRight, Briefcase, Cloud, Building2 } from 'lucide-react';

export interface ComparisonPreset {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  labelA: string;
  labelB: string;
  docA: string;
  docB: string;
}

export const COMPARISON_PRESETS: ComparisonPreset[] = [
  {
    id: 'employment-contract',
    title: 'Employment Offer vs Counter',
    description: 'Compare initial compensation & non-compete vs revised candidate redline.',
    icon: Briefcase,
    labelA: 'Initial Offer',
    labelB: 'Counter Offer',
    docA: `1. COMPENSATION & INCENTIVES: Employee shall receive an annual base salary of $120,000, payable in accordance with the Company's standard payroll schedule. Discretionary performance bonuses may be granted annually at the sole discretion of the Board.
2. RESTRICTIVE COVENANTS: For a period of twenty-four (24) months following termination of employment for any reason, Employee agrees not to engage, directly or indirectly, in any business competing with the Company within North America.
3. TERMINATION NOTICE: The Company may terminate employment without cause upon providing seven (7) business days prior written notice or payment in lieu thereof. Employee must provide thirty (30) days notice.
4. INTELLECTUAL PROPERTY: Employee assigns all rights, title, and interest in all inventions created during the term of employment, whether or not conceived during working hours or using Company equipment.`,
    docB: `1. COMPENSATION & INCENTIVES: Employee shall receive an annual base salary of $135,000, with a guaranteed minimum target bonus of 15% subject to corporate milestone achievement.
2. RESTRICTIVE COVENANTS: For a period of six (6) months following termination, Employee shall not solicit Company clients directly serviced during the preceding twelve months. No general geographic non-compete applies.
3. TERMINATION NOTICE: Either party may terminate employment without cause upon providing thirty (30) days prior written notice.
4. INTELLECTUAL PROPERTY: Employee assigns inventions created during working hours utilizing Company facilities directly related to Company's proprietary business. Background IP remains sole property of Employee.`,
  },
  {
    id: 'saas-sla-terms',
    title: 'Vendor SLA vs Client Terms',
    description: 'Standard cloud service order vs enterprise-negotiated master redline.',
    icon: Cloud,
    labelA: 'Vendor Standard SLA',
    labelB: 'Enterprise Redline',
    docA: `SECTION 4: SERVICE LEVEL AVAILABILITY & CREDITS.
Vendor targets 99.5% monthly availability, excluding scheduled maintenance. Service credits are capped at 5% of monthly fees as the sole and exclusive remedy for downtime.
SECTION 8: LIMITATION OF LIABILITY & INDEMNITY.
Vendor liability is strictly capped at aggregate fees paid by Customer during the three (3) months preceding the incident. Customer shall indemnify Vendor against all third-party claims arising from Customer data. Vendor provides no warranty regarding uptime continuity or data recovery speed.`,
    docB: `SECTION 4: SERVICE LEVEL AVAILABILITY & CREDITS.
Vendor guarantees 99.95% monthly uptime 24x7x365. Service credits scale progressively up to 30% of monthly fees for outages exceeding two hours, without prejudice to termination rights for chronic breaches.
SECTION 8: LIMITATION OF LIABILITY & INDEMNITY.
Each party indemnifies the other for third-party claims arising from gross negligence, breach of confidentiality, or IP infringement. Aggregate liability cap is set at twelve (12) months of aggregate contract fees.`,
  },
  {
    id: 'commercial-lease',
    title: 'Master Lease vs Tenant Draft',
    description: 'Landlord-favored standard lease agreement vs balanced commercial tenant draft.',
    icon: Building2,
    labelA: 'Landlord Master Lease',
    labelB: 'Tenant Draft',
    docA: `CLAUSE 12: MAINTENANCE, REPAIRS, AND TRIPLE NET EXPENSES.
Tenant shall be exclusively responsible for all maintenance, replacement, and structural repairs of the HVAC systems, roof, and foundation. Operating expenses shall be assessed monthly without annual reconciliation audits.
CLAUSE 19: ASSIGNMENT & SUBLETTING.
Tenant shall not assign or sublet premises under any condition without Landlord's absolute, unreviewable discretion. Any profit realized from subleasing belongs 100% to Landlord.`,
    docB: `CLAUSE 12: MAINTENANCE, REPAIRS, AND OPERATING EXPENSES.
Landlord retains responsibility for all capital replacements, roof, foundation, and core structural elements. Tenant maintains non-structural interior premises. Operating expenses are subject to annual certified CPA reconciliation with tenant audit rights.
CLAUSE 19: ASSIGNMENT & SUBLETTING.
Tenant may assign or sublet to an affiliate or successor entity without Landlord consent, and to third parties subject to Landlord's consent not to be unreasonably withheld, conditioned, or delayed.`,
  },
];

export interface ComparisonPresetCardsProps {
  onSelectPreset: (preset: { docA: string; docB: string; labelA: string; labelB: string }) => void;
}

export function ComparisonPresetCards({ onSelectPreset }: ComparisonPresetCardsProps) {
  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
          Quick-Start Comparison Presets
        </span>
        <span className="text-xs text-slate-400">Click to pre-fill both zones</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {COMPARISON_PRESETS.map((preset) => {
          const Icon = preset.icon;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                onSelectPreset({
                  docA: preset.docA,
                  docB: preset.docB,
                  labelA: preset.labelA,
                  labelB: preset.labelB,
                })
              }
              className="group text-left rounded-lg border border-[#1E293B] bg-[#111827] p-4 transition-all duration-200 hover:border-[#D4AF37]/50 hover:bg-[#111827]/90 hover:shadow-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-md bg-[#0B0F17] border border-[#1E293B] flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37]/40 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-sm font-semibold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                {preset.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
