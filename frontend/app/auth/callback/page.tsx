'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const urlError = searchParams.get('error');

    if (urlError) {
      setError(urlError);
      return;
    }

    if (token) {
      try {
        // Store token in localStorage and cookies
        localStorage.setItem('card-setu-token', token);
        document.cookie = `card-setu-token=${token}; path=/; max-age=2592000; SameSite=Lax`;

        // Perform a hard reload redirect to dashboard to ensure AuthContext refreshes
        window.location.href = '/dashboard';
      } catch (err) {
        setError('Failed to complete authentication. Please try again.');
      }
    } else {
      setError('No authentication token received.');
    }
  }, [searchParams]);

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      <main style={{
        background: '#060d1f',
        minHeight: '100vh',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        position: 'relative',
        fontFamily: 'Inter, sans-serif'
      }}>
        {/* Background gradient blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '25%', left: '25%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)' }} />
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '48px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}>
          {error ? (
            <div>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '24px'
              }}>
                ✕
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Authentication Failed</h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>{error}</p>
              <button 
                onClick={() => router.push('/login')}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#ffffff',
                  padding: '12px 24px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <div>
              {/* Animated loader */}
              <div style={{
                position: 'relative',
                width: '72px',
                height: '72px',
                margin: '0 auto 28px'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  border: '4px solid rgba(59, 130, 246, 0.1)',
                  borderRadius: '50%'
                }} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  border: '4px solid transparent',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s cubic-bezier(0.55, 0.055, 0.675, 0.19) infinite'
                }} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', letterSpacing: '-0.02em' }}>
                Completing Sign In
              </h2>
              <p style={{
                color: '#9ca3af',
                fontSize: '14px',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}>
                Please wait while we set up your session...
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
