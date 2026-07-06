import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Card Setu',
  description: 'Card Setu SaaS',
  icons: {
    icon: '/favicon.png',
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
