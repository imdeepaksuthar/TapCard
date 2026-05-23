'use client';

import { useState } from 'react';
import Image from 'next/image';
import LeadForm from '../../../components/LeadForm';

export default function PublicCardView({ data }: { data: any }) {
  const { card } = data;
  const personalInfo = card.personal_info || {};
  const contactButtons = card.contact_buttons || {};
  const socialLinks = card.social_links || {};
  const paymentInfo = card.payment_info || {};
  const customBranding = card.custom_branding || {};

  const [isDarkMode, setIsDarkMode] = useState(customBranding.dark_mode_enabled ?? true);

  const getHexColor = (color: string) => {
    if (color?.startsWith('#')) return color;
    const map: { [key: string]: string } = {
      blue: '#3b82f6',
      indigo: '#6366f1',
      purple: '#a855f7',
      green: '#22c55e',
      rose: '#f43f5e',
      orange: '#f97316',
      slate: '#64748b'
    };
    return map[color] || '#534AB7'; // Default to Figma purple
  };

  const themeColor = card.theme_color || 'blue';
  const primaryColor = card.theme?.primary_color || getHexColor(themeColor);

  return (
    <main className={`min-h-screen ${isDarkMode ? 'dark bg-[#0F0F14] text-[#F5F5F8]' : 'bg-[#F8F9FA] text-[#0F0F14]'} pb-32 transition-colors duration-300 font-sans flex justify-center`}>
      
      {/* Mobile Wrapper */}
      <div className={`w-full max-w-md ${isDarkMode ? 'bg-[#0F0F14]' : 'bg-white'} min-h-screen shadow-xl relative`}>
        
        {/* Banner / Cover */}
        <div className="relative h-48 w-full overflow-hidden" style={{ backgroundColor: primaryColor }}>
          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(135deg, ${primaryColor} 0%, #1A1A2E 100%)`, opacity: 0.8 }} />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff), linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }} />
          
          {/* Theme Toggle Button */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all z-10"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            )}
          </button>
        </div>

        {/* Main Content Container */}
        <div className="px-4 relative -mt-16">
          
          {/* Profile Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Added primaryColor as fallback background for transparent images */}
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-gray-800" style={{ backgroundColor: primaryColor }}>
                {card.profile_image ? (
                  <Image src={card.profile_image} alt="Profile" width={128} height={128} className="object-cover h-full w-full" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl text-white font-bold">
                    {personalInfo.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-gray-800">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
            </div>
            
            <h1 className="mt-3 text-xl font-bold">{personalInfo.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{personalInfo.designation}</p>
            
            {/* Badges */}
            <div className="mt-2 flex gap-2">
              {personalInfo.company && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-[#1A1A24] text-gray-300' : 'bg-[#F5F5F8] text-gray-700'}`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0V9a2 2 0 012-2h2a2 2 0 012 2v12"></path></svg>
                  {personalInfo.company}
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: primaryColor }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                NFC Enabled
              </span>
            </div>
          </div>

          {/* Quick Action Bar (Grid) - Updated to match Figma Image */}
          <div className="mt-6 grid grid-cols-4 gap-3">
            {contactButtons.call && (
              <a href={`tel:${contactButtons.call}`} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border ${isDarkMode ? 'bg-[#1A1A24] border-white/5 hover:bg-[#1A1A24]/80' : 'bg-[#F8F9FA] border-gray-100 hover:bg-[#F5F5F8]'} transition-all shadow-sm`}>
                <div className="text-[#1D9E75]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </div>
                <span className="text-xs font-medium">Call</span>
              </a>
            )}
            {contactButtons.whatsapp && (
              <a href={`https://wa.me/${contactButtons.whatsapp}`} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border ${isDarkMode ? 'bg-[#1A1A24] border-white/5 hover:bg-[#1A1A24]/80' : 'bg-[#F8F9FA] border-gray-100 hover:bg-[#F5F5F8]'} transition-all shadow-sm`}>
                <div className="text-[#25D366]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L3 21v-4a2 2 0 01-2-2V6a2 2 0 012-2h11a2 2 0 012 2v2m-7 8a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l4-4H9z"></path></svg>
                </div>
                <span className="text-xs font-medium">WhatsApp</span>
              </a>
            )}
            {contactButtons.email && (
              <a href={`mailto:${contactButtons.email}`} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border ${isDarkMode ? 'bg-[#1A1A24] border-white/5 hover:bg-[#1A1A24]/80' : 'bg-[#F8F9FA] border-gray-100 hover:bg-[#F5F5F8]'} transition-all shadow-sm`}>
                <div style={{ color: primaryColor }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <span className="text-xs font-medium">Email</span>
              </a>
            )}
            <div className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border cursor-pointer ${isDarkMode ? 'bg-[#1A1A24] border-white/5 hover:bg-[#1A1A24]/80' : 'bg-[#F8F9FA] border-gray-100 hover:bg-[#F5F5F8]'} transition-all shadow-sm`}>
              <div className="text-[#D85A30]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              </div>
              <span className="text-xs font-medium">Save</span>
            </div>
          </div>

          {/* About Section */}
          {personalInfo.bio && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">ABOUT</h3>
              <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-[#1A1A24]' : 'bg-[#F5F5F8]'}`}>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {personalInfo.bio}
                </p>
              </div>
            </div>
          )}

          {/* Connect Section */}
          {Object.keys(socialLinks).length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">CONNECT</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  url && (
                    <a 
                      key={platform} 
                      href={url as string} 
                      target="_blank" 
                      rel="noreferrer" 
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-transform hover:scale-105 ${
                        isDarkMode ? 'bg-[#1A1A24] text-gray-300' : 'bg-[#F5F5F8] text-gray-700'
                      }`}
                    >
                      <span className="capitalize">{platform}</span>
                    </a>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Products & Services (Placeholder for UI) */}
          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">PRODUCTS & SERVICES</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-[#1A1A24]' : 'bg-[#F5F5F8]'}`}>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl mb-2 flex items-center justify-center text-gray-400 text-xs">Product Image</div>
                <p className="text-sm font-medium">Product 1</p>
                <p className="text-xs text-gray-500">Description here</p>
              </div>
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-[#1A1A24]' : 'bg-[#F5F5F8]'}`}>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl mb-2 flex items-center justify-center text-gray-400 text-xs">Product Image</div>
                <p className="text-sm font-medium">Product 2</p>
                <p className="text-xs text-gray-500">Description here</p>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">BUSINESS DETAILS</h3>
            <div className={`space-y-3 p-4 rounded-2xl ${isDarkMode ? 'bg-[#1A1A24]' : 'bg-[#F5F5F8]'}`}>
              {card.company_details?.address && (
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: primaryColor }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-sm">{card.company_details.address}</p>
                  </div>
                </div>
              )}
              {card.company_details?.website && (
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: primaryColor }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.658 0 3-1.342 3-3s-1.342-3-3-3m0 6c-1.658 0-3-1.342-3-3s1.342-3 3-3m0 0a9 9 0 010-18m0 18a9 9 0 000-18m0 0H3m18 0h-3"></path></svg>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Website</p>
                    <a href={card.company_details.website} target="_blank" rel="noreferrer" className="text-sm" style={{ color: primaryColor }}>{card.company_details.website}</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pay Me Section */}
          {paymentInfo.qr_path && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">PAY ME</h3>
              <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-[#1A1A24]' : 'bg-[#F5F5F8]'} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Scan QR or pay via UPI</p>
                    <p className="text-xs text-gray-500">{paymentInfo.upi}</p>
                  </div>
                </div>
                <div className="h-16 w-16 overflow-hidden rounded-lg border bg-white p-1">
                  <Image src={paymentInfo.qr_path} alt="Payment QR" width={64} height={64} className="object-cover" />
                </div>
              </div>
            </div>
          )}

          {/* Send an Inquiry Form */}
          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">SEND AN INQUIRY</h3>
            <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-[#1A1A24]' : 'bg-[#F5F5F8]'}`}>
              <p className="text-sm font-bold mb-1">Send an Inquiry</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">We'll get back to you within 24 hours</p>
              <LeadForm cardId={card.id} />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 mb-6 text-center text-xs text-gray-500">
            Powered by Card Setu
          </div>
        </div>

        {/* Fixed/Sticky Footer */}
        <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 p-4 border-t ${isDarkMode ? 'bg-[#0F0F14] border-gray-800' : 'bg-white border-gray-200'} flex gap-4 shadow-lg`}>
          {contactButtons.call && (
            <a href={`tel:${contactButtons.call}`} className="flex-1 flex items-center justify-center gap-2 h-12 rounded-full text-white text-sm font-medium transition hover:opacity-90" style={{ backgroundColor: primaryColor }}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
              Call Now
            </a>
          )}
          {contactButtons.whatsapp && (
            <a href={`https://wa.me/${contactButtons.whatsapp}`} className="flex-1 flex items-center justify-center gap-2 h-12 rounded-full bg-[#25D366] text-white text-sm font-medium transition hover:bg-[#25D366]/90">
              <span className="font-bold text-sm">WA</span>
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
