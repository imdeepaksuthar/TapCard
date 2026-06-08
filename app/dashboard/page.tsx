'use client';

import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalCards: 0,
    activeCards: 0,
    totalLeads: 0,
    profileViews: 0,
  });

  const [cards, setCards] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Action states
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const [cardsRes, leadsRes] = await Promise.all([
          apiFetch<{ cards: any[] }>('/api/cards'),
          apiFetch<{ leads: any[] }>('/api/leads')
        ]);

        const fetchedCards = cardsRes.cards || [];
        const leads = leadsRes.leads || [];

        setCards(fetchedCards);

        const totalCards = fetchedCards.length;
        const activeCards = fetchedCards.filter((c: any) => c.status === 'active').length;
        const profileViews = fetchedCards.reduce((sum: number, c: any) => sum + (c.views_count || 0), 0);
        const totalLeads = leads.length;

        setStats({
          totalCards,
          activeCards,
          totalLeads,
          profileViews,
        });

        // Set recent leads (top 5)
        setRecentLeads(leads.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleExportLeads = async () => {
    try {
      const res = await apiFetch<{ leads: any[] }>('/api/leads');
      const leads = res.leads || [];
      if (leads.length === 0) {
        alert('No leads available to export.');
        return;
      }
      
      // Generate CSV
      const headers = ['Name', 'Email', 'Phone', 'Message', 'Date'];
      const rows = leads.map(lead => [
        `"${(lead.name || '').replace(/"/g, '""')}"`,
        `"${(lead.email || '').replace(/"/g, '""')}"`,
        `"${(lead.phone || '').replace(/"/g, '""')}"`,
        `"${(lead.message || '').replace(/"/g, '""')}"`,
        `"${new Date(lead.created_at).toLocaleDateString()}"`
      ]);
      
      const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "leads_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export leads:', err);
      alert('Failed to export leads. Please try again.');
    }
  };

  if (!user) return null; // Handled by layout/middleware

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-fluid-lg space-y-fluid-lg">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-fluid-md">
        <div>
          <h1 className="text-fluid-2xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-gray-400 text-fluid-sm">Here is what's happening with your cards today.</p>
        </div>
        {stats.totalCards === 0 && (
          <button 
            onClick={() => router.push('/dashboard/cards/create')}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Create New Card
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(clamp(200px,30vw,300px),1fr))] gap-fluid-md">
        <StatCard title="Active Cards" value={stats.activeCards} icon="active" color="green" />
        <StatCard title="Total Leads" value={stats.totalLeads} icon="leads" color="indigo" />
        <StatCard title="Profile Views" value={stats.profileViews} icon="views" color="purple" />
      </div>

      {/* Grid Layout for Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-fluid-lg">
        {/* Recent Leads (Large) */}
        <div className="bg-[#0B1528]/50 backdrop-blur-xl border border-white/5 rounded-2xl p-fluid-lg overflow-hidden">
          <div className="flex justify-between items-center mb-fluid-md">
            <h3 className="text-fluid-lg font-bold">Recent Leads</h3>
            <button className="text-sm text-blue-500 hover:text-blue-400 font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-400">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Phone / Msg</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">No leads yet</td>
                  </tr>
                )}
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 last:border-0 text-gray-300">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-white">{lead.name}</p>
                      <p className="text-xs text-gray-500">{lead.email || 'No email'}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-sm">{lead.phone || '-'}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[150px]">{lead.message || ''}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <button className="text-gray-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats / Info (Small) */}
        <div className="bg-[#0B1528]/50 backdrop-blur-xl border border-white/5 rounded-2xl p-fluid-lg">
          <h3 className="text-fluid-lg font-bold mb-fluid-md">Quick Actions</h3>
          <div className="space-y-fluid-sm">
            <QuickActionButton 
              icon="qr" 
              title="Share QR Code" 
              description="Show your card QR" 
              onClick={() => {
                if (cards.length === 0) {
                  alert('Please create a business card first!');
                  return;
                }
                setIsQrOpen(true);
              }}
            />
            <QuickActionButton 
              icon="export" 
              title="Export Leads" 
              description="Download as CSV" 
              onClick={handleExportLeads}
            />
          </div>
        </div>
      </div>

      {/* Share QR Code Modal */}
      {isQrOpen && cards[0] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[#090f1e] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
          >
            <button 
              onClick={() => setIsQrOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <h3 className="text-xl font-bold mb-2">Share Your Card</h3>
            <p className="text-sm text-gray-400 mb-6">Scan the QR code below to view your digital business card.</p>
            
            <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-inner">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/${cards[0].slug}`)}`} 
                alt="Card QR Code" 
                className="w-48 h-48"
              />
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3 mb-6">
              <span className="text-xs text-gray-300 truncate select-all">{`${typeof window !== 'undefined' ? window.location.origin : ''}/${cards[0].slug}`}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/${cards[0].slug}`);
                  setQrCopied(true);
                  setTimeout(() => setQrCopied(false), 2000);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors whitespace-nowrap"
              >
                {qrCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <a 
              href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/${cards[0].slug}`)}`}
              target="_blank"
              rel="noreferrer"
              download="card_qr.png"
              className="w-full block bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20"
            >
              Download QR Image
            </a>
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'indigo' | 'purple';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorMap = {
    blue: 'from-blue-500/20 to-blue-600/5 text-blue-500 bg-blue-500/10',
    green: 'from-green-500/20 to-green-600/5 text-green-500 bg-green-500/10',
    indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-500 bg-indigo-500/10',
    purple: 'from-purple-500/20 to-purple-600/5 text-purple-500 bg-purple-500/10',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]} backdrop-blur-xl border border-white/5 rounded-2xl p-fluid-md`}>
      <div className="flex justify-between items-start mb-fluid-sm">
        <div>
          <p className="text-gray-400 text-fluid-sm font-medium">{title}</p>
          <p className="text-fluid-3xl font-bold mt-1">{value.toLocaleString()}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color].split(' ')[3]}`}>
          <StatIcon name={icon} />
        </div>
      </div>
    </div>
  );
}

function StatIcon({ name }: { name: string }) {
  const baseClasses = "w-6 h-6";
  switch (name) {
    case 'cards':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
        </svg>
      );
    case 'active':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    case 'leads':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      );
    case 'views':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
      );
    default:
      return null;
  }
}

interface QuickActionButtonProps {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
}

function QuickActionButton({ icon, title, description, onClick }: QuickActionButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 flex items-center gap-4 transition-all duration-300 group"
    >
      <div className="w-10 h-10 bg-white/5 group-hover:bg-blue-500/20 rounded-lg flex items-center justify-center transition-all duration-300">
        <QuickActionIcon name={icon} />
      </div>
      <div className="text-left">
        <p className="font-medium group-hover:text-white transition-all duration-300">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <svg className="w-5 h-5 text-gray-500 ml-auto group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
      </svg>
    </button>
  );
}

function QuickActionIcon({ name }: { name: string }) {
  const baseClasses = "w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-all duration-300";
  switch (name) {
    case 'qr':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 4h3m-9-4h3m-3 4h3m-6-4h3m-3 4h3m-3 4h3m-3-12h3m-3 4h3m-3 4h3m-3-12h3m-3 4h3m-3 4h3"></path>
        </svg>
      );
    case 'export':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
      );
    default:
      return null;
  }
}
