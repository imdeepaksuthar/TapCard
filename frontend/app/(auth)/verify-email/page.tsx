'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { useRouter } from 'next/navigation';

export default function VerifyEmail() {
  const { user, isLoading } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.email_verified_at) {
      router.push('/dashboard');
      return;
    }

    // Auto-poll GET /api/user every 5s
    const interval = setInterval(async () => {
      try {
        const data = await apiFetch<{ user: any }>('/api/user');
        if (data.user.email_verified_at) {
          clearInterval(interval);
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Polling failed:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, isLoading, router]);

  const handleResend = async () => {
    setIsResending(true);
    setMessage('');
    try {
      await apiFetch('/api/email/verification-notification', { method: 'POST' });
      setMessage('Verification link sent!');
    } catch (error) {
      setMessage('Failed to resend verification link.');
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#030712] text-white overflow-hidden flex flex-col justify-center items-center px-4">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,rgba(0,0,0,0)_70%)]" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.1)_0%,rgba(0,0,0,0)_70%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-xl"
        >
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
          <p className="text-gray-400 mb-6">
            Check your inbox at <span className="text-white font-medium">{user.email}</span>
          </p>

          <p className="text-sm text-gray-500 mb-8">
            We've sent a verification link to your email address. Please click the link to verify your account.
          </p>

          <button
            onClick={handleResend}
            disabled={isResending}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-semibold text-white transition-all duration-300 backdrop-blur-sm disabled:opacity-50 flex justify-center items-center"
          >
            {isResending ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              'Resend verification email'
            )}
          </button>

          {message && (
            <p className={`text-sm mt-4 ${message.includes('failed') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
            <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full" />
            Waiting for verification...
          </div>
        </motion.div>
      </div>
    </main>
  );
}
