'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../../components/NotificationBell';
import { Toaster } from '../../components/toast';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hideShopModules, setHideShopModules] = useState(true);
  const [isProfessional, setIsProfessional] = useState(false);
  const [isCheckingCardType, setIsCheckingCardType] = useState(true);
  const [hasCard, setHasCard] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/login';
    }
  }, [isLoading, user]);

  useEffect(() => {
    if (!user) return;
    const checkCardType = async () => {
      try {
        const token = localStorage.getItem('card-setu-token');
        if (!token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/cards`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          const cards = json.cards || [];
          if (cards.length === 0) {
            setHideShopModules(true);
            setIsProfessional(false);
            setHasCard(false);
          } else {
            setHasCard(true);
            const activeCard = cards[0];
            const type = activeCard ? (activeCard.card_type || activeCard.template_id || '') : '';
            if (type === 'personal') {
              setHideShopModules(true);
              setIsProfessional(false);
            } else if (type === 'professional') {
              setHideShopModules(false);
              setIsProfessional(true);
            } else {
              setHideShopModules(false);
              setIsProfessional(false);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch cards in layout', err);
      } finally {
        setIsCheckingCardType(false);
      }
    };
    checkCardType();
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-zinc-500 text-sm">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#030712] text-white flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-[var(--width-fluid-sidebar-mobile)] lg:w-[var(--width-fluid-sidebar)] bg-black/60 backdrop-blur-2xl border-r border-white/[0.06] flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundImage: 'linear-gradient(160deg, rgba(30,40,80,0.5) 0%, rgba(5,8,20,0.7) 100%)' }}
      >
        {/* Sidebar top shimmer */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
        <div className="p-fluid-lg flex justify-between items-center">
          <img src="/logo-dark.png" alt="Card Setu Logo" className="h-8 w-auto opacity-90" />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-zinc-500 hover:text-white transition-colors lg:hidden w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-fluid-md space-y-fluid-xs overflow-y-auto custom-scrollbar">
          <SidebarLink href="/dashboard" icon="dashboard" active={pathname === '/dashboard'} onClick={() => setIsSidebarOpen(false)}>Dashboard</SidebarLink>
          <SidebarLink href="/dashboard/cards" icon="cards" active={pathname === '/dashboard/cards'} onClick={() => setIsSidebarOpen(false)}>My Cards</SidebarLink>
          {isCheckingCardType ? (
            <div className="py-2 flex justify-center">
              <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Services & Appointments — only visible for professional cards */}
              {isProfessional && (
                <>
                  <SidebarLink href="/dashboard/services" icon="services" active={pathname === '/dashboard/services'} onClick={() => setIsSidebarOpen(false)}>
                    Services
                  </SidebarLink>
                  <SidebarLink href="/dashboard/appointments" icon="appointments" active={pathname === '/dashboard/appointments'} onClick={() => setIsSidebarOpen(false)}>
                    Appointments
                  </SidebarLink>
                </>
              )}
              {/* Products & Orders — only for non-personal, non-professional cards */}
              {!hideShopModules && !isProfessional && (
                <>
                  <SidebarLink href="/dashboard/products" icon="products" active={pathname === '/dashboard/products'} onClick={() => setIsSidebarOpen(false)}>
                    Products
                  </SidebarLink>
                  <SidebarLink href="/dashboard/orders" icon="orders" active={pathname === '/dashboard/orders'} onClick={() => setIsSidebarOpen(false)}>Orders</SidebarLink>
                </>
              )}
              {/* Leads & Analytics — only shown if the user has created a card */}
              {hasCard && (
                <>
                  <SidebarLink href="/dashboard/leads" icon="leads" active={pathname === '/dashboard/leads'} onClick={() => setIsSidebarOpen(false)}>Leads</SidebarLink>
                  <SidebarLink href="/dashboard/analytics" icon="analytics" active={pathname === '/dashboard/analytics'} onClick={() => setIsSidebarOpen(false)}>Analytics</SidebarLink>
                </>
              )}
            </>
          )}
          <SidebarLink href="/dashboard/settings" icon="settings" active={pathname === '/dashboard/settings'} onClick={() => setIsSidebarOpen(false)}>Settings</SidebarLink>
        </nav>
        <div className="p-fluid-md border-t border-white/[0.05] relative">
          {/* Bottom glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <div className="flex items-center gap-3 mb-4">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover border border-white/10 ring-1 ring-blue-500/10" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center font-bold text-blue-400 text-sm border border-blue-500/15">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate text-zinc-100">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full bg-white/[0.04] hover:bg-red-500/10 hover:text-red-400 border border-white/[0.08] hover:border-red-500/20 py-2.5 rounded-xl font-medium text-sm text-zinc-400 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="relative z-50 bg-black/40 backdrop-blur-2xl border-b border-white/[0.05] h-[clamp(3.5rem,8vw,4.5rem)] flex items-center justify-between px-fluid-lg">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <div className="flex items-center gap-fluid-sm">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-zinc-400 hover:text-white lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/[0.06] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-fluid-xl font-bold">
              {pathname === '/dashboard' ? 'Dashboard' :
               pathname === '/dashboard/cards' ? 'My Cards' :
               pathname === '/dashboard/products' ? 'Products' :
               pathname === '/dashboard/services' ? 'Services' :
               pathname === '/dashboard/appointments' ? 'Appointments' :
               pathname === '/dashboard/leads' ? 'Leads' :
               pathname === '/dashboard/analytics' ? 'Analytics' :
               pathname === '/dashboard/settings' ? 'Settings' : 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2.5">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover border border-white/10" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full flex items-center justify-center font-bold text-indigo-400 text-xs border border-indigo-500/15">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-medium text-sm text-zinc-200 hidden sm:inline">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global toast notifications */}
      <Toaster />
    </div>
  );
}

interface SidebarLinkProps {
  href: string;
  icon: string;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

function SidebarLink({ href, icon, children, active, onClick }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-fluid-sm px-fluid-md py-fluid-sm rounded-xl font-medium text-fluid-sm transition-all duration-300 relative group ${
        active
          ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/80 text-white shadow-lg shadow-blue-500/15 border border-blue-500/20'
          : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
      }`}
    >
      {active && <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-xl" />}
      <SidebarIcon name={icon} />
      {children}
    </Link>
  );
}

function SidebarIcon({ name }: { name: string }) {
  const baseClasses = "w-5 h-5";
  switch (name) {
    case 'dashboard':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"></path>
        </svg>
      );
    case 'cards':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
        </svg>
      );
    case 'services':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      );
    case 'products':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
      );
    case 'orders':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
        </svg>
      );
    case 'leads':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      );
    case 'analytics':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0h6v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4zm0 0h6v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2z"></path>
        </svg>
      );
    case 'appointments':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      );
    case 'settings':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      );
    default:
      return null;
  }
}
