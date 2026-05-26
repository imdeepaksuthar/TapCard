'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../../../lib/api';

export default function VerifyEmailHandler() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    
    if (params.id && params.hash) {
      hasFetched.current = true;
      apiFetch(`/api/email/verify/${params.id}/${params.hash}`)
        .then((res: any) => {
          setStatus('success');
          setMessage(res.message || 'Email verified successfully! You can now log in.');
        })
        .catch((err: any) => {
          setStatus('error');
          setMessage(err.message || 'Verification failed. The link might be expired or invalid.');
        });
    }
  }, [params]);

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
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          {status === 'loading' && 'Verifying...'}
          {status === 'success' && 'Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h1>
        
        <p style={{ color: status === 'error' ? '#fca5a5' : '#9ca3af', marginBottom: '24px', lineHeight: '1.6' }}>
          {message}
        </p>
        
        {status !== 'loading' && (
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
        )}
      </div>
    </div>
  );
}
