import React from 'react';
import { ShieldAlert, AlertTriangle, Scale } from 'lucide-react';

export const DISCLAIMER_TEXT = {
  banner:
    'Gavel provides legal information and educational assistance only. It does not provide legal advice and does not create an attorney-client relationship. Always consult a qualified lawyer for specific legal issues.',
  cardTitle: 'Mandatory Legal Notice & Statutory Safe Harbor',
  cardSummary:
    'Gavel is an automated legal intelligence platform designed strictly for informational and educational purposes. Gavel is not a law firm, does not provide legal advice, and does not create an attorney-client relationship.',
  counselWarning:
    'Always consult a qualified, licensed lawyer or advocate for formal legal advice regarding specific legal agreements or disputes.',
  aiLimitation:
    'AI analysis may contain inaccuracies or omissions. Verify all critical terms, statutory rights, and obligations with licensed counsel before signing or acting.',
};

export interface LegalDisclaimerProps {
  className?: string;
}

/**
 * Universal persistent sticky bottom banner anchored across all viewports.
 * Structurally non-dismissible per statutory non-UPL requirements (CORE-02, D-05).
 */
export function LegalDisclaimerBanner({ className = '' }: LegalDisclaimerProps) {
  return (
    <aside
      data-testid="legal-disclaimer-banner"
      aria-label="Legal Disclaimer"
      role="complementary"
      className={`fixed bottom-0 left-0 right-0 z-50 bg-[#0B0F17]/95 backdrop-blur border-t border-[#1E293B] shadow-[0_-4px_16px_rgba(0,0,0,0.4)] px-4 py-2.5 text-xs text-slate-300 ${className}`}
    >
      <div className="container mx-auto max-w-7xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <ShieldAlert className="h-4 w-4 shrink-0 text-[#F59E0B]" aria-hidden="true" />
          <p className="leading-snug text-slate-300">
            <strong className="font-semibold text-white mr-1.5">Legal Notice:</strong>
            {DISCLAIMER_TEXT.banner}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-1.5 shrink-0 text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider">
          <Scale className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Non-UPL Protected</span>
        </div>
      </div>
    </aside>
  );
}

/**
 * Prominent card component placed directly above analysis viewports.
 * Structurally non-dismissible without any close or toggle handlers.
 */
export function LegalDisclaimerCard({ className = '' }: LegalDisclaimerProps) {
  return (
    <section
      data-testid="legal-disclaimer-card"
      aria-label="Statutory Legal Disclaimer Card"
      className={`rounded-lg border border-[#D4AF37]/30 bg-[#111827] p-4 sm:p-5 shadow-lg ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="rounded-md bg-[#D4AF37]/10 p-2 text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-serif text-base font-semibold text-white tracking-wide">
              {DISCLAIMER_TEXT.cardTitle}
            </h3>
            <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-950/40 px-2.5 py-0.5 text-[11px] font-mono text-amber-400">
              Informational Only
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {DISCLAIMER_TEXT.cardSummary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-400">
            <div className="flex items-start gap-2 bg-[#0F172A]/70 rounded p-2 border border-[#1E293B]">
              <ShieldAlert className="h-3.5 w-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-200">No Representation:</strong> No attorney-client relationship is created through use of this platform.
              </span>
            </div>
            <div className="flex items-start gap-2 bg-[#0F172A]/70 rounded p-2 border border-[#1E293B]">
              <Scale className="h-3.5 w-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-200">Independent Review:</strong> {DISCLAIMER_TEXT.counselWarning}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic pt-0.5">
            {DISCLAIMER_TEXT.aiLimitation}
          </p>
        </div>
      </div>
    </section>
  );
}
