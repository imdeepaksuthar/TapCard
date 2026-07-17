'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/toast';

function AppointmentRow({ apt, updateStatus }: { apt: any, updateStatus: (id: number, status: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  // Derive initial for avatar
  const initial = apt.name ? apt.name.charAt(0).toUpperCase() : '?';
  // Pick a color based on initial
  const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500'];
  const colorIndex = apt.name ? apt.name.charCodeAt(0) % colors.length : 0;
  const avatarBg = colors[colorIndex];

  return (
    <div className="group">
      <div className="flex items-center p-4 border-b border-[var(--d-border)] group-last:border-0 hover:bg-[var(--d-hover)] transition-colors cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {/* Plus Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 border-2 border-[var(--d-surface)] text-white shadow-sm ring-1 ring-black/10 dark:ring-white/10 mr-4 transition-transform hover:scale-110"
        >
          <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Checkbox (Aesthetic matching user request) */}
        <div className="shrink-0 mr-4" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-[var(--d-elevate)] border-[var(--d-border)] cursor-pointer" />
        </div>
        
        {/* Avatar */}
        <div className={`shrink-0 w-12 h-12 ${avatarBg} rounded-2xl flex items-center justify-center text-white font-bold text-xl mr-4 shadow-sm`}>
          {initial}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="text-base font-semibold text-blue-500 truncate">{apt.name}</div>
            <div className="text-sm text-[var(--d-text-muted)] flex items-center gap-1.5 mt-0.5 truncate">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" /></svg>
              {apt.business_card?.slug || 'Card Booking'}
            </div>
          </div>
          
          {/* Desktop visible columns */}
          <div className="hidden sm:flex items-center gap-8 text-sm shrink-0">
            <div className="text-[var(--d-text-muted)] w-32">
              <div className="text-[var(--d-text)] font-medium">{new Date(apt.date).toLocaleDateString()}</div>
              <div>{apt.time}</div>
            </div>
            <div className="w-24">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                ${apt.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}
                ${apt.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                ${apt.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                ${apt.status === 'completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
              `}>
                {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded State */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[var(--d-surface-2)] border-b border-[var(--d-border)] group-last:border-0"
          >
            <div className="p-5 sm:pl-[120px] flex flex-col sm:flex-row gap-6">
              {/* Mobile details (hidden on desktop) */}
              <div className="sm:hidden space-y-3 flex-1">
                <div>
                  <div className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Date & Time</div>
                  <div className="text-sm font-medium text-[var(--d-text)]">{new Date(apt.date).toLocaleDateString()} at {apt.time}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Status</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                    ${apt.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}
                    ${apt.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                    ${apt.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                    ${apt.status === 'completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
                  `}>
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Contact & Notes */}
              <div className="space-y-3 flex-1">
                 <div>
                  <div className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Contact Info</div>
                  <div className="text-sm text-[var(--d-text-muted)] flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {apt.email || 'No email provided'}
                  </div>
                  {apt.phone && (
                    <div className="text-sm text-[var(--d-text-muted)] flex items-center gap-2 mt-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {apt.phone}
                    </div>
                  )}
                </div>
                {apt.notes && (
                  <div className="mt-4">
                    <div className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Notes</div>
                    <div className="text-sm text-[var(--d-text-muted)] bg-[var(--d-elevate)] p-3 rounded-xl border border-[var(--d-border)]">
                      {apt.notes}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="space-y-3 flex-1 sm:max-w-[200px]">
                <div onClick={(e) => e.stopPropagation()}>
                  <div className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-2">Update Status</div>
                  <select 
                    value={apt.status}
                    onChange={(e) => updateStatus(apt.id, e.target.value)}
                    className="w-full bg-[var(--d-elevate)] border border-[var(--d-border)] rounded-xl px-4 py-2 text-sm text-[var(--d-text)] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirm</option>
                    <option value="completed">Complete</option>
                    <option value="cancelled">Cancel</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('card-setu-token') : null;
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to fetch appointments');
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('card-setu-token') : null;
    if (!token) return;
    
    try {
      // Optimistic UI update
      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status } : apt));
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      // fetchAppointments(); // Already optimistically updated, can skip or re-fetch silently
    } catch (err: any) {
      toast.error('Error updating status: ' + err.message);
      fetchAppointments(); // Revert on failure
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--d-text)] tracking-tight">Appointments</h1>
          <p className="text-[var(--d-text-muted)] mt-1">Manage your native bookings</p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4">
          {error}
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-[var(--d-elevate)] border border-[var(--d-border)] rounded-3xl p-16 text-center shadow-xl">
          <div className="mx-auto h-20 w-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[var(--d-text)] mb-2 tracking-tight">No Appointments Yet</h3>
          <p className="text-[var(--d-text-muted)] max-w-sm mx-auto">When clients book appointments through your card, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-[var(--d-elevate)] border border-[var(--d-border)] rounded-2xl overflow-hidden shadow-xl">
          <div className="divide-y divide-[var(--d-border)]">
            {appointments.map((apt) => (
              <AppointmentRow key={apt.id} apt={apt} updateStatus={updateStatus} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
