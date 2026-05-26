'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPrompt() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';

  return (
    <div style={{
      background: '#060d1f',
      minHeight: '100vh',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '48px 16px',
    }}>
      <div style={{ maxWidth: '420px', textAlign: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '36px', backdropFilter: 'blur(24px)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Verify your email</h1>
        <p style={{ color: '#9ca3af', marginBottom: '24px', lineHeight: '1.6' }}>
          We've sent a verification email to <strong style={{ color: '#fff' }}>{email}</strong>. 
          Please check your inbox and click the link to activate your account.
        </p>
        
        <div style={{ marginTop: '32px' }}>
          <Link href="/login" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            borderRadius: '12px',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
          }}>
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
