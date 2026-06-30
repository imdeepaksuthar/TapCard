'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ApiError } from '../../../lib/api';

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [phoneBlurred, setPhoneBlurred] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const phoneDigits = phone.replace(/\D/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: ['Passwords do not match'] });
      setIsLoading(false);
      return;
    }
    try {
      await register({ name, email, phone: phoneDigits || null, password, password_confirmation: confirmPassword });
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.errors);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setIsGoogleLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    window.location.href = `${apiUrl}/api/auth/google/redirect`;
  };

  const EyeIcon = ({ open }: { open: boolean }) => open
    ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

  const SpinnerSVG = () => (
    <svg style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24">
      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-card { animation: fadeUp 0.45s ease-out both; }
        .auth-input {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 12px; padding: 12px 16px;
          color: #ffffff; font-size: 14px; outline: none;
          transition: border-color 0.2s;
        }
        .auth-input:focus { border-color: #3b82f6; }
        .auth-input::placeholder { color: #6b7280; }
        .auth-input.error { border-color: #ef4444; }
        .auth-btn {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          border: none; border-radius: 12px;
          color: #ffffff; font-size: 15px; font-weight: 600;
          cursor: pointer; box-shadow: 0 4px 20px rgba(59,130,246,0.4);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity 0.2s, transform 0.2s;
        }
        .auth-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .social-btn {
          width: 100%; padding: 11px; border-radius: 12px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.15);
          color: #e5e7eb; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: background 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .social-btn:hover:not(:disabled) { background: rgba(255,255,255,0.14); }
        .social-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <main style={{
        background: '#060d1f', minHeight: '100vh', color: '#ffffff',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '48px 16px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Gradient blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px' }}>
          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Link href="/" style={{ display: 'flex', justifyContent: 'center' }}>
              <img src="/logo-dark.png" alt="Card Setu Logo" style={{ height: '48px', width: 'auto' }} />
            </Link>
            <p style={{ color: '#9ca3af', marginTop: '8px', fontSize: '14px' }}>Join us and bridge your digital presence.</p>
          </div>

          {/* Card */}
          <div className="auth-card" style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px', padding: '36px',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, textAlign: 'center', marginBottom: '28px', color: '#ffffff' }}>Create Account</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#d1d5db', marginBottom: '8px' }}>Full Name</label>
                <input type="text" className={`auth-input${errors.name ? ' error' : ''}`} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required minLength={2} />
                {errors.name && <p style={{ color: '#fca5a5', fontSize: '12px', marginTop: '4px' }}>{errors.name[0]}</p>}
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#d1d5db', marginBottom: '8px' }}>Email Address</label>
                <input type="email" className={`auth-input${errors.email ? ' error' : ''}`} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                {errors.email && <p style={{ color: '#fca5a5', fontSize: '12px', marginTop: '4px' }}>{errors.email[0]}</p>}
              </div>

              {/* Phone */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#d1d5db' }}>Phone <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span></label>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{phoneDigits.length}/10</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input type="tel" className={`auth-input${errors.phone || (phoneBlurred && phoneDigits.length > 0 && phoneDigits.length !== 10) ? ' error' : ''}`} value={phone} onChange={e => setPhone(e.target.value)} onBlur={() => setPhoneBlurred(true)} placeholder="10-digit mobile number" inputMode="numeric" />
                  {phoneDigits.length === 10 && (
                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                      <svg width="18" height="18" fill="#22c55e" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    </div>
                  )}
                </div>
                {phoneBlurred && phoneDigits.length > 0 && phoneDigits.length !== 10 && <p style={{ color: '#fca5a5', fontSize: '12px', marginTop: '4px' }}>Must be exactly 10 digits</p>}
                {errors.phone && <p style={{ color: '#fca5a5', fontSize: '12px', marginTop: '4px' }}>{errors.phone[0]}</p>}
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#d1d5db', marginBottom: '8px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} className={`auth-input${errors.password ? ' error' : ''}`} style={{ paddingRight: '44px' }} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {errors.password && <p style={{ color: '#fca5a5', fontSize: '12px', marginTop: '4px' }}>{errors.password[0]}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#d1d5db', marginBottom: '8px' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirm ? 'text' : 'password'} className={`auth-input${errors.confirmPassword ? ' error' : ''}`} style={{ paddingRight: '44px' }} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your password" required />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {errors.confirmPassword && <p style={{ color: '#fca5a5', fontSize: '12px', marginTop: '4px' }}>{errors.confirmPassword[0]}</p>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={isLoading || isGoogleLoading} className="auth-btn" style={{ marginTop: '4px' }}>
                {isLoading
                  ? <><SpinnerSVG /> Creating account...</>
                  : 'Create Account'
                }
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ padding: '0 16px', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                Or sign up with
              </div>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button type="button" onClick={handleGoogleSignup} disabled={isGoogleLoading || isLoading} className="social-btn">
                {isGoogleLoading ? (
                  <><SpinnerSVG /> Connecting to Google…</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="17" height="17">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#9ca3af' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </main>
    </>
  );
}
