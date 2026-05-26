'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const { login } = useAuth();

  // OTP Login States
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpArray, setOtpArray] = useState<string[]>(Array(6).fill(''));
  const otpCode = otpArray.join('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('error');
      if (err) {
        setError(err);
      }
    }
  }, []);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Focus first OTP field on send
  useEffect(() => {
    if (otpSent) {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, [otpSent]);

  const handleOtpChange = (val: string, index: number) => {
    const cleanVal = val.replace(/\D/g, '');
    const newOtp = [...otpArray];
    
    if (cleanVal.length > 0) {
      const lastChar = cleanVal.slice(-1);
      newOtp[index] = lastChar;
      setOtpArray(newOtp);
      
      if (index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    } else {
      newOtp[index] = '';
      setOtpArray(newOtp);
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otpArray[index] && index > 0) {
        const newOtp = [...otpArray];
        newOtp[index - 1] = '';
        setOtpArray(newOtp);
        otpRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otpArray];
        newOtp[index] = '';
        setOtpArray(newOtp);
      }
      e.preventDefault();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '').substring(0, 6);
    if (pasteData.length > 0) {
      const pasteDigits = pasteData.split('');
      const newOtp = [...otpArray];
      for (let i = 0; i < 6; i++) {
        if (pasteDigits[i]) {
          newOtp[i] = pasteDigits[i];
        }
      }
      setOtpArray(newOtp);
      
      const nextFocusIndex = Math.min(pasteDigits.length, 5);
      otpRefs.current[nextFocusIndex]?.focus();
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      await apiFetch('/api/email/verification-notification', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setError('Verification link sent! Please check your email.');
      setNeedsVerification(false);
    } catch (err: any) {
      setError(err.message || 'Failed to resend email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setOtpLoading(true);
    try {
      await apiFetch<{ message: string }>('/api/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setOtpSent(true);
      setResendCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loginMethod === 'otp' && !otpSent) {
      handleSendOTP();
      return;
    }

    setIsLoading(true);
    try {
      if (loginMethod === 'password') {
        await login({ email, password });
      } else {
        if (!otpCode) {
          setError('Please enter the 6-digit verification code.');
          setIsLoading(false);
          return;
        }
        const data = await apiFetch<any>('/api/auth/otp/login', {
          method: 'POST',
          body: JSON.stringify({ email, code: otpCode }),
        });
        
        localStorage.setItem('card-setu-token', data.token);
        document.cookie = `card-setu-token=${data.token}; path=/; max-age=2592000; SameSite=Lax`;
        
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      if (err.data?.needs_verification) {
        setError(err.message);
        setNeedsVerification(true);
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    window.location.href = `${apiUrl}/api/auth/google/redirect`;
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-card {
          animation: fadeUp 0.45s ease-out both;
        }
        .auth-input {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 12px;
          padding: 12px 16px;
          color: #ffffff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .auth-input:focus { border-color: #3b82f6; }
        .auth-input::placeholder { color: #6b7280; }
        .auth-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          border: none;
          border-radius: 12px;
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(59,130,246,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s, transform 0.2s;
        }
        .auth-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .social-btn {
          padding: 11px;
          border-radius: 12px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.15);
          color: #e5e7eb;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .social-btn:hover { background: rgba(255,255,255,0.14); }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
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
        padding: '48px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Gradient blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-15%', left: '-5%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px' }}>
          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Link href="/" style={{ display: 'flex', justifyContent: 'center' }}>
              <img src="/logo-dark.png" alt="Card Setu Logo" style={{ height: '48px', width: 'auto' }} />
            </Link>
            <p style={{ color: '#9ca3af', marginTop: '8px', fontSize: '14px' }}>Welcome back! Sign in to your account.</p>
          </div>

          {/* Card */}
          <div className="auth-card" style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px',
            padding: '36px',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, textAlign: 'center', marginBottom: '28px', color: '#ffffff' }}>Sign In</h2>

            {error && (
              <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', fontSize: '13px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Toggle switch between Password and Email OTP */}
              <div style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '4px',
                borderRadius: '14px',
                marginBottom: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('password'); setError(''); }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: loginMethod === 'password' ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: loginMethod === 'password' ? '#ffffff' : '#9ca3af',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: loginMethod === 'password' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('otp'); setError(''); }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: loginMethod === 'otp' ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: loginMethod === 'otp' ? '#ffffff' : '#9ca3af',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: loginMethod === 'otp' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  Email OTP
                </button>
              </div>

              {/* Email Address (Always visible) */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#d1d5db', marginBottom: '8px' }}>Email Address</label>
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loginMethod === 'otp' && otpSent}
                  style={loginMethod === 'otp' && otpSent ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                />
              </div>

              {/* PASSWORD FLOW */}
              {loginMethod === 'password' && (
                <>
                  {/* Password */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500, color: '#d1d5db' }}>Password</label>
                      <Link href="/forgot-password" style={{ fontSize: '13px', color: '#60a5fa', textDecoration: 'none' }}>Forgot password?</Link>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="auth-input"
                        style={{ paddingRight: '44px' }}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required={loginMethod === 'password'}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                        {showPassword
                          ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                  </div>

                  {/* Remember me */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="remember" style={{ width: '16px', height: '16px', accentColor: '#3b82f6', cursor: 'pointer' }} />
                    <label htmlFor="remember" style={{ fontSize: '13px', color: '#9ca3af', cursor: 'pointer' }}>Remember me for 30 days</label>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={isLoading} className="auth-btn">
                    {isLoading
                      ? <><svg style={{ animation: 'spin 1s linear infinite', width: '18px', height: '18px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Signing in...</>
                      : 'Sign In'
                    }
                  </button>
                </>
              )}

              {/* EMAIL OTP FLOW */}
              {loginMethod === 'otp' && (
                <>
                  {otpSent && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 500, color: '#d1d5db' }}>Verification Code</label>
                        <button
                          type="button"
                          onClick={() => { setOtpSent(false); setOtpArray(Array(6).fill('')); }}
                          style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '13px', cursor: 'pointer', padding: 0 }}
                        >
                          Change Email
                        </button>
                      </div>
                      
                      {/* 6 separate inputs for verification code */}
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '16px 0' }}>
                        {otpArray.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={el => { otpRefs.current[idx] = el; }}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleOtpChange(e.target.value, idx)}
                            onKeyDown={e => handleOtpKeyDown(e, idx)}
                            onPaste={handleOtpPaste}
                            style={{
                              width: '46px',
                              height: '52px',
                              textAlign: 'center',
                              fontSize: '20px',
                              fontWeight: '700',
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: '1px solid rgba(255, 255, 255, 0.18)',
                              borderRadius: '12px',
                              color: '#ffffff',
                              outline: 'none',
                              transition: 'all 0.2s',
                              borderColor: digit ? '#3b82f6' : 'rgba(255, 255, 255, 0.18)',
                              boxShadow: digit ? '0 0 10px rgba(59, 130, 246, 0.2)' : 'none'
                            }}
                            onFocus={e => {
                              e.target.style.borderColor = '#3b82f6';
                              e.target.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.3)';
                            }}
                            onBlur={e => {
                              e.target.style.borderColor = digit ? '#3b82f6' : 'rgba(255, 255, 255, 0.18)';
                              e.target.style.boxShadow = digit ? '0 0 10px rgba(59, 130, 246, 0.2)' : 'none';
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Didn\'t receive code?'}
                        </span>
                        {resendCountdown === 0 && (
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={otpLoading}
                            style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '12px', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                          >
                            {otpLoading ? 'Sending...' : 'Resend OTP'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Send OTP button or Verify & Submit button */}
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpLoading}
                      className="auth-btn"
                    >
                      {otpLoading
                        ? <><svg style={{ animation: 'spin 1s linear infinite', width: '18px', height: '18px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Sending Code...</>
                        : 'Send Verification Code'
                      }
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="auth-btn"
                    >
                      {isLoading
                        ? <><svg style={{ animation: 'spin 1s linear infinite', width: '18px', height: '18px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Verifying...</>
                        : 'Sign In with OTP'
                      }
                    </button>
                  )}
                </>
              )}
            </form>

            {/* Divider */}
            <div style={{ position: 'relative', margin: '24px 0' }}>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#060d1f', padding: '0 12px', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                Or continue with
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button type="button" onClick={handleGoogleLogin} className="social-btn">Google</button>
              <button className="social-btn">GitHub</button>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#9ca3af' }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
          </p>
        </div>
      </main>
    </>
  );
}
