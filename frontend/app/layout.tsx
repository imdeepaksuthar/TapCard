import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Card Setu',
  description: 'Card Setu SaaS',
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
