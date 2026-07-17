'use client';

import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

export default function Settings() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
      // Keep the sidebar/header (context-driven) in sync with the new details.
      await refreshUser();
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
      await apiFetch('/api/user/password', {
        method: 'PUT',
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      });
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

  const handleDeleteAccount = async () => {
    setError('');
    setIsDeleting(true);
    try {
      await apiFetch('/api/user', {
        method: 'DELETE',
        body: JSON.stringify({ password: deletePassword }),
      });
      // Clear the local session and return to the homepage.
      localStorage.removeItem('card-setu-token');
      document.cookie = 'card-setu-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/';
    } catch (err: any) {
      setShowDeleteModal(false);
      setError(err?.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--d-surface)] text-[var(--d-text)] flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Title Section */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-[var(--d-text)] tracking-tight">Account Settings</h1>
        <p className="text-[var(--d-text-muted)] mt-2">Manage your profile and security preferences.</p>
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
      <div className="bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] rounded-3xl p-6 sm:p-8 shadow-xl">
        <h3 className="text-xl font-bold text-[var(--d-text)] mb-6">Profile Information</h3>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--d-text-muted)] block mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[var(--d-surface-2)] border border-[var(--d-border)] hover:border-[var(--d-border)] focus:border-blue-500/50 rounded-2xl px-5 py-3.5 text-[var(--d-text)] text-sm outline-none transition-all duration-300 shadow-inner"
              placeholder="Your Name"
            />
          </div>
            
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--d-text-muted)] block mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full bg-[var(--d-surface-2)] border border-[var(--d-border)] rounded-2xl px-5 py-3.5 text-[var(--d-text-faint)] cursor-not-allowed text-sm shadow-inner"
              placeholder="your@email.com"
            />
            <p className="text-xs text-gray-600 mt-1">Email cannot be changed.</p>
          </div>
            
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--d-text-muted)] block mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[var(--d-surface-2)] border border-[var(--d-border)] hover:border-[var(--d-border)] focus:border-blue-500/50 rounded-2xl px-5 py-3.5 text-[var(--d-text)] text-sm outline-none transition-all duration-300 shadow-inner"
              placeholder="+1234567890"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/30 active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 mt-6"
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
      <div className="bg-[var(--d-surface)] backdrop-blur-xl border border-[var(--d-border)] rounded-3xl p-6 sm:p-8 shadow-xl mt-8">
        <h3 className="text-xl font-bold text-[var(--d-text)] mb-6">Security</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--d-text-muted)] block mb-2">Current Password</label>
            <input
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              className="w-full bg-[var(--d-surface-2)] border border-[var(--d-border)] hover:border-[var(--d-border)] focus:border-blue-500/50 rounded-2xl px-5 py-3.5 text-[var(--d-text)] text-sm outline-none transition-all duration-300 shadow-inner"
              placeholder="••••••••"
            />
          </div>
            
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--d-text-muted)] block mb-2">New Password</label>
            <input
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              className="w-full bg-[var(--d-surface-2)] border border-[var(--d-border)] hover:border-[var(--d-border)] focus:border-blue-500/50 rounded-2xl px-5 py-3.5 text-[var(--d-text)] text-sm outline-none transition-all duration-300 shadow-inner"
              placeholder="••••••••"
            />
          </div>
            
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--d-text-muted)] block mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.new_password_confirmation}
              onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
              className="w-full bg-[var(--d-surface-2)] border border-[var(--d-border)] hover:border-[var(--d-border)] focus:border-blue-500/50 rounded-2xl px-5 py-3.5 text-[var(--d-text)] text-sm outline-none transition-all duration-300 shadow-inner"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="bg-[var(--d-elevate)] hover:bg-[var(--d-hover)] border border-[var(--d-border)] text-[var(--d-text)] font-bold py-3 px-8 rounded-2xl transition-all duration-300 disabled:opacity-50 flex justify-center items-center gap-2 mt-6 active:scale-95"
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
      <div className="bg-[var(--d-surface)] backdrop-blur-xl border border-red-500/20 rounded-3xl p-6 sm:p-8 shadow-xl mt-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <h3 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h3>
        <p className="text-sm text-[var(--d-text-muted)] mb-6">Once you delete your account, there is no going back. Please be certain.</p>
        <button
          onClick={() => { setDeletePassword(''); setDeleteConfirm(''); setError(''); setShowDeleteModal(true); }}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 px-8 rounded-2xl font-bold transition-all duration-300 active:scale-95 shadow-sm"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Account confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          />
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-red-500/20 bg-[var(--d-surface)] p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-[var(--d-text)]">Delete your account?</h3>
            <p className="mt-2 text-sm text-[var(--d-text-muted)]">
              This permanently deletes your account along with your cards, products, services and leads. This cannot be undone.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--d-text-muted)] block mb-2">Password</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full bg-[var(--d-surface-2)] border border-[var(--d-border)] focus:border-red-500/50 rounded-2xl px-5 py-3 text-[var(--d-text)] text-sm outline-none transition-all"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-600 mt-1">Leave blank if you signed up with Google.</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--d-text-muted)] block mb-2">
                  Type <span className="text-red-400 font-mono">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="w-full bg-[var(--d-surface-2)] border border-[var(--d-border)] focus:border-red-500/50 rounded-2xl px-5 py-3 text-[var(--d-text)] text-sm outline-none transition-all"
                  placeholder="DELETE"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 bg-[var(--d-elevate)] hover:bg-[var(--d-hover)] border border-[var(--d-border)] text-[var(--d-text)] font-bold py-3 rounded-2xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirm !== 'DELETE'}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
