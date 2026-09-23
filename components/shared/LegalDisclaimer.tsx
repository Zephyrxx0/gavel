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
      className={`fixed bottom-0 left-0 right-0 z-50 bg-[#FAF9F5]/95 backdrop-blur-xl border-t border-stone-200/90 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] px-4 py-2 text-xs text-stone-600 ${className}`}
    >
      <div className="container mx-auto max-w-6xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
          <p className="leading-snug text-stone-600 text-xs">
            <strong className="font-semibold text-stone-900 mr-1.5">Legal Notice:</strong>
            {DISCLAIMER_TEXT.banner}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-stone-600 uppercase tracking-wider bg-stone-100 border border-stone-200 px-2.5 py-0.5 rounded-full">
          <Scale className="h-3 w-3" aria-hidden="true" />
          <span>Non-UPL Safe Harbor</span>
        </div>
      </div>
    </aside>
  );
}

/**
 * Prominent card component placed directly above analysis viewports.
 * Structurally non-dismissible without any close or toggle handlers.
 * Styled in a calm, soft-parchment editorial format.
 */
export function LegalDisclaimerCard({ className = '' }: LegalDisclaimerProps) {
  return (
    <section
      data-testid="legal-disclaimer-card"
      aria-label="Statutory Legal Disclaimer Card"
      className={`rounded-2xl border border-[#EFE7DC] bg-[#FAF6F0] p-4 sm:p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="rounded-xl bg-[#FAF0E1] p-2.5 text-[#8C6D42] shrink-0 border border-[#EADAC5]">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-serif text-sm sm:text-base font-semibold text-stone-900 tracking-wide">
              {DISCLAIMER_TEXT.cardTitle}
            </h3>
            <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-mono text-amber-800 font-medium">
              Informational Only
            </span>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
            {DISCLAIMER_TEXT.cardSummary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-stone-600">
            <div className="flex items-start gap-2 bg-white/70 rounded-lg p-2.5 border border-[#EFE7DC]">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span className="leading-snug">
                <strong className="text-stone-900">No Representation:</strong> No attorney-client relationship is created through use of this platform.
              </span>
            </div>
            <div className="flex items-start gap-2 bg-white/70 rounded-lg p-2.5 border border-[#EFE7DC]">
              <Scale className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span className="leading-snug">
                <strong className="text-stone-900">Independent Review:</strong> {DISCLAIMER_TEXT.counselWarning}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-stone-500 italic pt-0.5">
            {DISCLAIMER_TEXT.aiLimitation}
          </p>
        </div>
      </div>
    </section>
  );
}
