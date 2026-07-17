import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cardsetu.com'),
  title: { default: 'Card Setu — Digital Business Cards for Modern Professionals' },
  description: 'Create a stunning digital business card. Share your contact details, products, services, and more with a single tap or scan.',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    siteName: 'Card Setu',
    type: 'website',
  },
};

// Opt into edge-to-edge rendering so `env(safe-area-inset-*)` reports real
// values on notched / foldable devices (used by the fixed bottom bars).
// `maximumScale`/`userScalable` are left at their accessible defaults so users
// can still pinch-zoom.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
