import type { Metadata } from 'next';
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';
import { Toaster } from '@/components/ui/sonner';
import { LegalDisclaimerBanner } from '@/components/shared/LegalDisclaimer';

const Agentation = dynamic(
  () => import('agentation').then((m) => m.Agentation),
  { ssr: false }
);

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Gavel — AI Legal Intelligence Platform',
  description:
    'Demystifying complex legal agreements with instant plain-English summaries, traffic-light risk analysis, and actionable negotiation checklists.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-background text-foreground font-sans min-h-screen flex flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 rounded-lg bg-stone-900 text-white px-4 py-2 text-xs font-medium shadow-lg ring-2 ring-stone-400 focus:outline-none"
        >
          Skip to main content
        </a>
        <div className="flex-1 pb-16">{children}</div>
        <LegalDisclaimerBanner />
        <Toaster />
        {process.env.NODE_ENV === 'development' && (
          <Agentation endpoint="http://localhost:4747" />
        )}
      </body>
    </html>
  );
}
