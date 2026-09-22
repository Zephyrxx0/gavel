'use client';

import React from 'react';
import { DisputeCategory } from '@/lib/schemas/situation';
import { Home, Briefcase, ShoppingBag, DollarSign, Sparkles } from 'lucide-react';

export interface QuickStartPreset {
  id: string;
  title: string;
  category: DisputeCategory;
  categoryLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  snippet: string;
  description: string;
}

export const PRESETS: QuickStartPreset[] = [
  {
    id: 'tenancy-deposit',
    title: 'Security Deposit Withheld',
    category: 'tenancy',
    categoryLabel: 'Tenancy',
    icon: Home,
    snippet:
      'Moved out 35 days ago after giving proper 30-day notice. Landlord is withholding the entire $2,400 deposit without an itemized statement or receipts.',
    description:
      'I moved out of my rental apartment 35 days ago after giving proper 30-day written notice and completing a walkthrough. My landlord is withholding the entire $2,400 security deposit without providing an itemized statement of deductions or contractor repair receipts required by state law. Despite sending two formal demand letters via certified mail requesting return within the statutory period, the landlord refuses to respond or refund the balance.',
  },
  {
    id: 'employment-termination',
    title: 'Termination Without Notice',
    category: 'employment',
    categoryLabel: 'Employment',
    icon: Briefcase,
    snippet:
      'Terminated abruptly after 2 years of employment with no written notice, no prior performance warnings, and no severance despite contract requiring 30 days notice.',
    description:
      'I was terminated abruptly after 2 years of employment as an operations manager with no written notice, no prior performance warnings, and no severance pay despite my signed employment contract requiring a mandatory 30-day notice period. When I requested my final paycheck and accrued paid time off, company management refused to provide severance or payment in lieu of notice and immediately revoked company systems access.',
  },
  {
    id: 'consumer-undelivered',
    title: 'Undelivered Consumer Goods',
    category: 'consumer',
    categoryLabel: 'Consumer',
    icon: ShoppingBag,
    snippet:
      'Paid $1,800 for custom home office furniture 8 weeks ago. Delivery was guaranteed within 14 days. Merchant is non-responsive and refused credit card refund.',
    description:
      'I paid $1,800 for custom home office furniture 8 weeks ago with guaranteed delivery in writing within 14 days of purchase. The delivery never arrived, tracking remains invalid, and the merchant is completely non-responsive to emails and phone calls. When I requested a transaction refund through customer support, the merchant formally refused a refund, claiming custom furniture orders cannot be canceled regardless of delivery non-performance.',
  },
  {
    id: 'freelance-unpaid-invoice',
    title: 'Unpaid Freelance Invoice',
    category: 'financial',
    categoryLabel: 'Freelance',
    icon: DollarSign,
    snippet:
      'Completed UI/UX contract deliverables signed off by client 60 days ago. Net-30 invoice for $4,500 remains unpaid and client has stopped responding to emails.',
    description:
      'I completed all UI/UX contract deliverables signed off by the client 60 days ago under our written freelance services agreement. My net-30 invoice for $4,500 remains unpaid and the client has stopped responding to emails and invoices. The completed software designs have already been deployed to production on their commercial website, yet management refuses to issue payment or communicate a settlement date.',
  },
];

export interface QuickStartCardsProps {
  onSelectScenario: (description: string, category: DisputeCategory) => void;
}

export function QuickStartCards({ onSelectScenario }: QuickStartCardsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>Quick-Start Dispute Scenarios</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectScenario(preset.description, preset.category)}
              className="text-left p-3.5 rounded-xl border border-slate-800 bg-[#111827]/80 hover:border-[#D4AF37]/50 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-2.5 shadow-sm"
              data-testid={`quick-start-${preset.id}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 group-hover:text-[#D4AF37] transition-colors">
                  <Icon className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {preset.categoryLabel}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Preset</span>
              </div>
              <div>
                <h4 className="font-sans text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {preset.title}
                </h4>
                <p className="mt-1 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {preset.snippet}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
