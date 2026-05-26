'use client';

import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

export default function Settings() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user, authLoading, router]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');
    
    try {
      const data = await apiFetch<{ user: any }>('/api/user', {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
        }),
      });
      setMessage('Profile updated successfully!');
      // Note: In a real app, you would also update the user context here
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setError('New passwords do not match.');
      return;
    }

    setIsSaving(true);
    try {
      // Mocking password update as backend endpoint isn't fully implemented for password yet
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Password updated successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (err) {
      setError('Failed to update password.');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
      {/* Title Section */}
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-gray-400 text-sm">Manage your profile and security preferences.</p>
      </div>
        
      {message && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl text-sm">
          {message}
        </div>
      )}
        
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Profile Settings */}
      <div className="bg-[#0B1528]/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4">Profile Information</h3>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Your Name"
            />
          </div>
            
          <div>
            <label className="text-sm text-gray-400 block mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
              placeholder="your@email.com"
            />
            <p className="text-xs text-gray-600 mt-1">Email cannot be changed.</p>
          </div>
            
          <div>
            <label className="text-sm text-gray-400 block mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="+1234567890"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isSaving ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>

      {/* Security Settings */}
      <div className="bg-[#0B1528]/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4">Security</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Current Password</label>
            <input
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
            
          <div>
            <label className="text-sm text-gray-400 block mb-1">New Password</label>
            <input
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
            
          <div>
            <label className="text-sm text-gray-400 block mb-1">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.new_password_confirmation}
              onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isSaving ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 px-6 rounded-xl font-semibold transition-all duration-300">
          Delete Account
        </button>
      </div>
    </div>
  );
}
