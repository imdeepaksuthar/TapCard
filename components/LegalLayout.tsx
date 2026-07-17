import Link from 'next/link';
import type { ReactNode } from 'react';

// Shared shell for the Privacy / Terms / Refund pages. Server component.
export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black text-zinc-300">
      <div className="mx-auto max-w-3xl px-[clamp(1.25rem,4vw,2rem)] py-[clamp(2.5rem,6vh,4rem)]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        <h1 className="mt-8 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: {updated}</p>

        <div className="legal-prose mt-8">{children}</div>

        <p className="mt-12 border-t border-zinc-900 pt-6 text-xs text-zinc-600">
          Questions about this policy? Contact us at{' '}
          <a href="mailto:support@cardsetu.com" className="text-blue-400">support@cardsetu.com</a>.
        </p>
      </div>
    </main>
  );
}
