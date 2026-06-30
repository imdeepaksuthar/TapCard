'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
      const registered = params.get('registered');
      const emailParam = params.get('email');

      if (emailParam) setEmail(decodeURIComponent(emailParam));

      if (registered === 'true') {
        setSuccessMessage("Registration successful! We've sent a verification email to your address. Please check your inbox and click the link to activate your account.");
        setNeedsVerification(true);
      } else if (err) {
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

  useEffect(() => {
    if (otpSent) {
      setTimeout(() => { otpRefs.current[0]?.focus(); }, 100);
    }
  }, [otpSent]);

  const handleOtpChange = (val: string, index: number) => {
    const cleanVal = val.replace(/\D/g, '');
    const newOtp = [...otpArray];
    if (cleanVal.length > 0) {
      newOtp[index] = cleanVal.slice(-1);
      setOtpArray(newOtp);
      if (index < 5) otpRefs.current[index + 1]?.focus();
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
        if (pasteDigits[i]) newOtp[i] = pasteDigits[i];
      }
      setOtpArray(newOtp);
      const nextFocusIndex = Math.min(pasteDigits.length, 5);
      otpRefs.current[nextFocusIndex]?.focus();
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await apiFetch('/api/email/verification-notification', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setSuccessMessage('Verification link sent! Please check your email.');
      setNeedsVerification(false);
    } catch (err: any) {
      setError(err.message || 'Failed to resend email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!email) { setError('Please enter your email address.'); return; }
    setError('');
    setSuccessMessage('');
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
    setSuccessMessage('');

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
      const isVerificationPending = err.data?.needs_verification ||
                                    err.message?.toLowerCase().includes('verify');
      if (isVerificationPending) {
        setError(err.message || 'Please verify your email address to log in.');
        setNeedsVerification(true);
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    window.location.href = `${apiUrl}/api/auth/google/redirect`;
  };

  const SpinnerSVG = () => (
    <svg className="w-[18px] h-[18px] shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  return (
    <main className="relative min-h-screen bg-[#060d1f] text-white flex flex-col justify-center items-center px-4 py-12 overflow-hidden">

      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.16)_0%,transparent_70%)]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.14)_0%,transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-900/10 blur-[80px] rounded-full" />
        {/* Dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">

        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-3">
            <img src="/logo-dark.png" alt="Card Setu Logo" className="h-11 w-auto hover:opacity-90 transition-opacity" />
          </Link>
          <p className="text-zinc-400 text-sm">Welcome back — sign in to your account.</p>
        </div>

        {/* Card */}
        <div
          className="ag-glass-card rounded-2xl p-8 relative overflow-hidden"
          style={{ animation: 'ag-entrance-up 0.45s ease-out both' }}
        >
          {/* Top shimmer */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          <h2 className="text-lg font-bold text-center mb-7 text-white">Sign In</h2>

          {/* Success banner */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm text-center">
              <div>{successMessage}</div>
              {needsVerification && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="mt-3 w-full py-2 px-4 rounded-lg bg-emerald-600/70 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
                >
                  {isLoading ? 'Resending…' : 'Resend Verification Email'}
                </button>
              )}
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm text-center">
              <div>{error}</div>
              {needsVerification && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="mt-3 w-full py-2 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold transition-all hover:-translate-y-px"
                >
                  {isLoading ? 'Resending…' : 'Resend Verification Email'}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Login Method Toggle */}
            <div className="flex bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl">
              {(['password', 'otp'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => { setLoginMethod(method); setError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
                    loginMethod === method
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {method === 'password' ? 'Password' : 'Email OTP'}
                </button>
              ))}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[13px] font-medium text-zinc-300 mb-2">Email Address</label>
              <input
                type="email"
                className="auth-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loginMethod === 'otp' && otpSent}
              />
            </div>

            {/* PASSWORD FLOW */}
            {loginMethod === 'password' && (
              <>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[13px] font-medium text-zinc-300">Password</label>
                    <Link href="/forgot-password" className="text-[13px] text-blue-400 hover:text-blue-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input pr-11"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required={loginMethod === 'password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                    >
                      {showPassword
                        ? <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <input type="checkbox" id="remember-password" className="w-4 h-4 accent-blue-500 cursor-pointer rounded" />
                  <label htmlFor="remember-password" className="text-[13px] text-zinc-500 cursor-pointer">Remember me for 30 days</label>
                </div>

                <button type="submit" disabled={isLoading} className="auth-btn">
                  {isLoading ? <><SpinnerSVG /> Signing in…</> : 'Sign In'}
                </button>
              </>
            )}

            {/* OTP FLOW */}
            {loginMethod === 'otp' && (
              <>
                {otpSent && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-[13px] font-medium text-zinc-300">Verification Code</label>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtpArray(Array(6).fill('')); }}
                        className="text-[13px] text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Change Email
                      </button>
                    </div>

                    {/* OTP boxes */}
                    <div className="flex gap-2 justify-center my-4">
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
                          className={`w-11 h-13 text-center text-xl font-bold bg-white/[0.07] border rounded-xl text-white outline-none transition-all duration-200 ${
                            digit
                              ? 'border-blue-500/60 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                              : 'border-white/[0.12] focus:border-blue-500/50 focus:shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                          }`}
                          style={{ height: '52px' }}
                        />
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-zinc-500">
                        {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : "Didn't receive code?"}
                      </span>
                      {resendCountdown === 0 && (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={otpLoading}
                          className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                        >
                          {otpLoading ? 'Sending…' : 'Resend OTP'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2.5">
                  <input type="checkbox" id="remember-otp" className="w-4 h-4 accent-blue-500 cursor-pointer rounded" />
                  <label htmlFor="remember-otp" className="text-[13px] text-zinc-500 cursor-pointer">Remember me for 30 days</label>
                </div>

                {!otpSent ? (
                  <button type="button" onClick={handleSendOTP} disabled={otpLoading} className="auth-btn">
                    {otpLoading ? <><SpinnerSVG /> Sending Code…</> : 'Send Verification Code'}
                  </button>
                ) : (
                  <button type="submit" disabled={isLoading} className="auth-btn">
                    {isLoading ? <><SpinnerSVG /> Verifying…</> : 'Sign In with OTP'}
                  </button>
                )}
              </>
            )}
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="px-4 text-[11px] text-zinc-600 uppercase tracking-widest whitespace-nowrap">Or continue with</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          <button type="button" onClick={handleGoogleLogin} disabled={isGoogleLoading || isLoading} className="social-btn">
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

        <p className="text-center mt-6 text-sm text-zinc-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
