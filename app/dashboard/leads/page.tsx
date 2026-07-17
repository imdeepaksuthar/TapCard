'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

interface Lead {
  id: number;
  card_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: 'new' | 'read' | 'archived';
  created_at: string;
  businessCard?: {
    id: number;
    slug: string;
  };
}

function LeadRow({ lead, updateLeadStatus, deleteLead }: { lead: Lead, updateLeadStatus: (id: number, status: 'read' | 'archived') => void, deleteLead: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);

  const initial = lead.name ? lead.name.charAt(0).toUpperCase() : '?';
  const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500'];
  const colorIndex = lead.name ? lead.name.charCodeAt(0) % colors.length : 0;
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

        {/* Checkbox */}
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
            <div className="text-base font-semibold text-blue-500 truncate">{lead.name}</div>
            <div className="text-sm text-[var(--d-text-muted)] flex items-center gap-1.5 mt-0.5 truncate">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" /></svg>
              {lead.businessCard?.slug || 'Card Form'}
            </div>
          </div>
          
          {/* Desktop visible columns */}
          <div className="hidden sm:flex items-center gap-8 text-sm shrink-0">
            <div className="text-[var(--d-text-muted)] w-32">
              <div className="text-[var(--d-text)] font-medium">{new Date(lead.created_at).toLocaleDateString()}</div>
              <div>{new Date(lead.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
            <div className="w-24">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                lead.status === 'new' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                lead.status === 'read' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                'bg-gray-500/10 text-[var(--d-text-faint)] border-gray-500/20'
              }`}>
                {lead.status.toUpperCase()}
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
                  <div className="text-sm font-medium text-[var(--d-text)]">{new Date(lead.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Status</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    lead.status === 'new' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    lead.status === 'read' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    'bg-gray-500/10 text-[var(--d-text-faint)] border-gray-500/20'
                  }`}>
                    {lead.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 flex-1">
                 <div>
                  <div className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Contact Info</div>
                  <div className="text-sm text-[var(--d-text-muted)] flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {lead.email || 'No email provided'}
                  </div>
                  {lead.phone && (
                    <div className="text-sm text-[var(--d-text-muted)] flex items-center gap-2 mt-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {lead.phone}
                    </div>
                  )}
                </div>
                {lead.message && (
                  <div className="mt-4">
                    <div className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-1">Message</div>
                    <div className="text-sm text-[var(--d-text-muted)] bg-[var(--d-elevate)] p-3 rounded-xl border border-[var(--d-border)] whitespace-pre-wrap">
                      {lead.message}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="space-y-3 flex-1 sm:max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                <div className="text-[10px] text-[var(--d-text-faint)] font-bold uppercase tracking-widest mb-2">Actions</div>
                <div className="flex flex-col gap-2">
                  {lead.status === 'new' && (
                    <button
                      onClick={() => updateLeadStatus(lead.id, 'read')}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-600 transition-colors text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Mark as Read
                    </button>
                  )}
                  {lead.status !== 'archived' && (
                    <button
                      onClick={() => updateLeadStatus(lead.id, 'archived')}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[var(--d-elevate)] hover:bg-[var(--d-hover)] border border-[var(--d-border)] text-[var(--d-text)] transition-colors text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 002 2h10a2 2 0 002-2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                      </svg>
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => deleteLead(lead.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Leads() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'archived'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchLeads = async () => {
      try {
        const data = await apiFetch<{ leads: Lead[] }>('/api/leads');
        setLeads(data.leads);
      } catch (error) {
        console.error('Failed to fetch leads:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchLeads();
    }
  }, [user, authLoading, router]);

  const updateLeadStatus = async (id: number, newStatus: 'read' | 'archived') => {
    try {
      await apiFetch(`/api/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
    } catch (error) {
      console.error('Failed to update lead status:', error);
    }
  };

  const deleteLead = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await apiFetch(`/api/leads/${id}`, { method: 'DELETE' });
      setLeads(leads.filter(lead => lead.id !== id));
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  const filteredLeads = filter === 'all' ? leads : leads.filter(lead => lead.status === filter);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--d-surface)] text-[var(--d-text)] flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">
      {/* Title Section with Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-[var(--d-text)] tracking-tight">Captured Leads</h1>
          <p className="text-[var(--d-text-muted)] mt-1">Manage contacts captured from your digital cards.</p>
        </div>
        <div className="flex items-center gap-3 bg-[var(--d-surface)] border border-[var(--d-border)] p-2 sm:p-2.5 rounded-2xl shadow-sm">
          <span className="text-[var(--d-text-muted)] text-sm pl-2 font-medium">Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-[var(--d-elevate)] border border-[var(--d-border)] hover:border-[var(--d-border)] focus:border-blue-500/50 rounded-xl px-4 py-1.5 text-sm font-semibold text-[var(--d-text)] outline-none transition-all duration-300 shadow-sm cursor-pointer"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-[var(--d-elevate)] border border-[var(--d-border)] rounded-3xl p-16 flex flex-col justify-center items-center text-center shadow-xl">
          <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-[var(--d-text)] mb-2">No leads found</h3>
          <p className="text-[var(--d-text-muted)] max-w-sm">When people submit contact forms on your digital cards, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-[var(--d-elevate)] border border-[var(--d-border)] rounded-2xl overflow-hidden shadow-xl">
          <div className="divide-y divide-[var(--d-border)]">
            {filteredLeads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} updateLeadStatus={updateLeadStatus} deleteLead={deleteLead} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
