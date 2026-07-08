'use client';

import { motion } from 'framer-motion';
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
      <div className="min-h-screen bg-[#030712] text-white flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">
      {/* Title Section with Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Captured Leads</h1>
          <p className="text-gray-400 mt-2">Manage contacts captured from your digital cards.</p>
        </div>
        <div className="flex items-center gap-3 bg-[#0B1528]/50 backdrop-blur-xl border border-white/10 p-2 sm:p-3 rounded-2xl shadow-lg">
          <span className="text-gray-400 text-sm pl-2 font-medium">Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-[#0F1C35]/80 border border-white/5 hover:border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-2 text-sm font-semibold text-gray-300 outline-none transition-all duration-300 shadow-inner cursor-pointer"
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
        <div className="bg-[#0B1528]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-16 flex flex-col justify-center items-center text-center shadow-xl">
          <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white mb-2">No leads found</h3>
          <p className="text-gray-400 max-w-sm">When people submit contact forms on your digital cards, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-[#0B1528]/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 bg-white/5">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Message</th>
                  <th className="py-4 px-6">Card</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 last:border-0 text-gray-300 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-white">{lead.name}</p>
                      <p className="text-xs text-gray-500">{new Date(lead.created_at).toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-6">
                      {lead.email && <p className="text-sm">{lead.email}</p>}
                      {lead.phone && <p className="text-xs text-gray-500">{lead.phone}</p>}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm truncate max-w-xs" title={lead.message || ''}>{lead.message || '-'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs bg-white/5 px-2 py-1 rounded-md text-gray-400">
                        {lead.businessCard?.slug || 'Card'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        lead.status === 'new' ? 'bg-blue-500/10 text-blue-500' :
                        lead.status === 'read' ? 'bg-green-500/10 text-green-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {lead.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {lead.status === 'new' && (
                          <button
                            onClick={() => updateLeadStatus(lead.id, 'read')}
                            className="text-gray-400 hover:text-green-500 transition-colors text-xs font-medium"
                            title="Mark as Read"
                          >
                            Mark Read
                          </button>
                        )}
                        {lead.status !== 'archived' && (
                          <button
                            onClick={() => updateLeadStatus(lead.id, 'archived')}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
                            title="Archive Lead"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 002 2h10a2 2 0 002-2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete Lead"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
