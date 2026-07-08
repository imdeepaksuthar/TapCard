'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/components/toast';

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
      fetchAppointments();
    } catch (err: any) {
      toast.error('Error updating status: ' + err.message);
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
          <h1 className="text-2xl font-bold text-[var(--d-text)]">Appointments</h1>
          <p className="text-[var(--d-text-muted)]">Manage your native bookings</p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4">
          {error}
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-[var(--d-elevate)] border border-[var(--d-border)] rounded-2xl p-12 text-center">
          <div className="mx-auto h-16 w-16 bg-[var(--d-elevate)] rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-[var(--d-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--d-text)] mb-2">No Appointments Yet</h3>
          <p className="text-[var(--d-text-muted)]">When clients book appointments through your card, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-[var(--d-elevate)] border border-[var(--d-border)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--d-text-muted)]">
              <thead className="bg-[var(--d-elevate)] text-xs uppercase text-[var(--d-text-muted)]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Client</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Date & Time</th>
                  <th className="px-6 py-4 font-semibold">Card</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--d-border)]">
                {appointments.map((apt) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={apt.id} 
                    className="hover:bg-[var(--d-hover)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--d-text)]">{apt.name}</div>
                      {apt.notes && <div className="text-xs text-[var(--d-text-faint)] mt-1 line-clamp-1">{apt.notes}</div>}
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="text-[var(--d-text-muted)]">{apt.email}</div>
                      {apt.phone && <div className="text-[var(--d-text-faint)]">{apt.phone}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[var(--d-text)]">{new Date(apt.date).toLocaleDateString()}</div>
                      <div className="text-[var(--d-text-muted)]">{apt.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {apt.business_card?.designation || apt.business_card?.slug || 'Unknown Card'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${apt.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                        ${apt.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : ''}
                        ${apt.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
                        ${apt.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                      `}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <select 
                        value={apt.status}
                        onChange={(e) => updateStatus(apt.id, e.target.value)}
                        className="bg-[var(--d-elevate)] border border-[var(--d-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--d-text)] focus:outline-none focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirm</option>
                        <option value="completed">Complete</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
