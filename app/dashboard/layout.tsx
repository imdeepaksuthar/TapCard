'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../../components/NotificationBell';
import { Toaster } from '../../components/toast';
import {
  LayoutDashboard, CreditCard, Wrench, Package, ShoppingCart, Users,
  ChartColumn, CalendarDays, Settings as SettingsIcon, Menu, X, LogOut, Sun, Moon,
} from 'lucide-react';


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

  // Theme: LIGHT by default; persisted per browser. Only the dashboard is themed.
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    try {
      if (localStorage.getItem('dash-theme') === 'dark') setTheme('dark');
    } catch {}
  }, []);
  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('dash-theme', next); } catch {}
      return next;
    });
  };
  const isDark = theme === 'dark';

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
      <div className={`dash-scope ${isDark ? 'dark' : ''} min-h-screen flex justify-center items-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-[var(--d-text-muted)] text-sm">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dash-scope ${isDark ? 'dark' : ''} h-screen flex overflow-hidden`}>
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
        className={`fixed lg:static inset-y-0 left-0 w-[var(--width-fluid-sidebar-mobile)] lg:w-[var(--width-fluid-sidebar)] bg-[var(--d-sidebar)] backdrop-blur-2xl border-r border-[var(--d-border)] flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-fluid-lg flex justify-between items-center">
          <BrandLogo />
          <button
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
            className="text-[var(--d-text-faint)] hover:text-[var(--d-text)] transition-colors lg:hidden w-8 h-8 rounded-lg hover:bg-[var(--d-hover)] flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 px-fluid-md space-y-fluid-xs overflow-y-auto custom-scrollbar">
          <SidebarLink href="/dashboard" icon="dashboard" active={pathname === '/dashboard'} onClick={() => setIsSidebarOpen(false)}>Dashboard</SidebarLink>
          <SidebarLink href="/dashboard/cards" icon="cards" active={pathname === '/dashboard/cards'} onClick={() => setIsSidebarOpen(false)}>My Cards</SidebarLink>
          {isCheckingCardType ? (
            <div className="py-2 flex justify-center">
              <div className="w-5 h-5 border-2 border-[var(--d-border)] border-t-[var(--d-text-muted)] rounded-full animate-spin"></div>
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
        <div className="p-fluid-md border-t border-[var(--d-border)]">
          <div className="flex items-center gap-3 mb-4">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover border border-[var(--d-border)]" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center font-bold text-[var(--d-accent)] text-sm border border-[var(--d-accent)]/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate text-[var(--d-text)]">{user.name}</p>
              <p className="text-xs text-[var(--d-text-faint)] truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full bg-[var(--d-elevate)] hover:bg-[var(--d-danger-soft)] hover:text-[var(--d-danger)] border border-[var(--d-border)] hover:border-[var(--d-danger)] py-2.5 rounded-xl font-medium text-sm text-[var(--d-text-muted)] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="relative z-30 bg-[var(--d-header)] backdrop-blur-2xl border-b border-[var(--d-border)] h-[clamp(3.5rem,8vw,4.5rem)] flex items-center justify-between px-fluid-lg">
          <div className="flex items-center gap-fluid-sm min-w-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Open menu"
              aria-expanded={isSidebarOpen}
              className="text-[var(--d-text-muted)] hover:text-[var(--d-text)] lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--d-hover)] transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <h2 className="text-fluid-xl font-bold truncate">
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
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Light / dark toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--d-text-muted)] hover:text-[var(--d-text)] hover:bg-[var(--d-hover)] transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
            </button>
            <NotificationBell />
            <div className="flex items-center gap-2.5">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover border border-[var(--d-border)]" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full flex items-center justify-center font-bold text-[var(--d-accent)] text-xs border border-[var(--d-accent)]/20">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-medium text-sm text-[var(--d-text)] hidden sm:inline">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[var(--d-bg)]">
          {children}
        </main>
      </div>

      {/* Global toast notifications */}
      <Toaster />
    </div>
  );
}

// Theme-adaptive wordmark (replaces the dark-only logo image so it reads in both modes).
function BrandLogo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--d-text)] shrink-0"
        style={{ background: 'linear-gradient(135deg, var(--d-accent-2), var(--d-accent))' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M5 12.55a8 8 0 0 1 14 0" />
          <path d="M8.5 15.5a3.5 3.5 0 0 1 7 0" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight text-[var(--d-text)]">
        Card <span className="text-[var(--d-accent)]">Setu</span>
      </span>
    </Link>
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
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20'
          : 'text-[var(--d-text-muted)] hover:text-[var(--d-text)] hover:bg-[var(--d-hover)]'
      }`}
    >
      <SidebarIcon name={icon} />
      {children}
    </Link>
  );
}

// Unified nav iconography — Lucide-React, one visual family across the panel.
const NAV_ICONS = {
  dashboard: LayoutDashboard,
  cards: CreditCard,
  services: Wrench,
  products: Package,
  orders: ShoppingCart,
  leads: Users,
  analytics: ChartColumn,
  appointments: CalendarDays,
  settings: SettingsIcon,
};

function SidebarIcon({ name }: { name: string }) {
  const Icon = NAV_ICONS[name as keyof typeof NAV_ICONS];
  return Icon ? <Icon className="w-5 h-5 shrink-0" strokeWidth={2} aria-hidden="true" /> : null;
}
