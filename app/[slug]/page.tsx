import { notFound } from 'next/navigation';
import Image from 'next/image';
import PublicCardView from './PublicCardView';

// Fetch public profile data server-side
async function getCardData(slug: string) {
  try {
    // Replace with absolute backend URL dynamically in production.
    // ISR: serve a cached render and refresh in the background at most once
    // per `revalidate` window. This cuts the blocking backend round-trip on
    // every visit (big TTFB win) and lets Next dedupe the metadata + page
    // fetches into a single cached request. Card edits appear within ~60s.
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/cards/public/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCardData(slug);
  
  if (!data || !data.card) {
    return { title: 'Card Not Found' };
  }

  const { card } = data;
  const personalInfo = card.personal_info || {};
  const name = personalInfo.name || 'Digital Business Card';
  const designation = personalInfo.designation ? ` - ${personalInfo.designation}` : '';
  const company = personalInfo.company_name ? ` at ${personalInfo.company_name}` : '';
  const bio = personalInfo.bio || `Connect with ${name} via their digital business card.`;
  
  const profileImage = card.profile_image || personalInfo.profile_image || null;
  const fullTitle = `${name}${designation}${company}`;

  return {
    title: fullTitle,
    description: bio,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: fullTitle,
      description: bio,
      type: 'profile',
      url: `/${slug}`,
      siteName: 'Card Setu',
      images: profileImage ? [{ url: profileImage }] : undefined,
    },
    twitter: {
      card: profileImage ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description: bio,
      images: profileImage ? [profileImage] : undefined,
    },
  };
}

export default async function PublicCardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Fetch card data which now includes scoped products and services
  const data = await getCardData(slug);

  if (!data || !data.card) {
    notFound();
  }

  const products = data.products || [];
  const services = data.services || [];

  const { card } = data;
  const personalInfo = card.personal_info || {};
  const contactButtons = card.contact_buttons || {};
  const socialLinks = card.social_links || {};
  const paymentInfo = card.payment_info || {};

  // Custom Branding Mapping
  const customBranding = card.custom_branding || {};
  const themeColor = customBranding.theme_color || 'blue';
  const isDarkMode = customBranding.dark_mode_enabled ?? true;

  const getHexColor = (color: string) => {
    if (color.startsWith('#')) return color;
    const map: { [key: string]: string } = {
      blue: '#3b82f6',
      indigo: '#6366f1',
      purple: '#a855f7',
      green: '#22c55e',
      rose: '#f43f5e',
      orange: '#f97316',
      slate: '#64748b'
    };
    return map[color] || '#3b82f6';
  };

  const primaryColor = data.theme?.primary_color || getHexColor(themeColor);

  // Person structured data so shared cards can earn rich results.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cardsetu.com';
  const companyName = (card.company_details && card.company_details.company_name) || personalInfo.company_name || null;
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: personalInfo.name || 'Digital Business Card',
    url: `${siteUrl}/${slug}`,
  };
  if (personalInfo.designation) jsonLd.jobTitle = personalInfo.designation;
  if (companyName) jsonLd.worksFor = { '@type': 'Organization', name: companyName };
  const jsonLdImage = card.profile_image || personalInfo.profile_image;
  if (jsonLdImage) jsonLd.image = jsonLdImage;
  if (contactButtons.email) jsonLd.email = contactButtons.email;
  if (contactButtons.call) jsonLd.telephone = contactButtons.call;

  // Escape so owner-controlled fields (name, company, etc.) can't break out of
  // the <script> tag — JSON.stringify alone does NOT neutralise "</script>".
  const LS = '\u2028'; // U+2028 LINE SEPARATOR
  const PS = '\u2029'; // U+2029 PARAGRAPH SEPARATOR
  const jsonLdHtml = JSON.stringify(jsonLd)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .split(LS).join('\\u2028')
    .split(PS).join('\\u2029');

  if (card.status === 'inactive') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-md w-full bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-slate-200/50 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-slate-200">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Profile Inactive</h1>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            The digital card for <span className="font-bold text-slate-700">{personalInfo.name || 'this user'}</span> is currently inactive or unavailable.
          </p>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-8" />

          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">Powered by</p>
          <a href="/" className="group flex items-center gap-2 mb-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg shadow-blue-500/20 bg-gradient-to-br from-blue-500 to-indigo-600 group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M5 12.55a8 8 0 0 1 14 0" />
                <path d="M8.5 15.5a3.5 3.5 0 0 1 7 0" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-slate-800">
              Card <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Setu</span>
            </span>
          </a>
          
          <a href="/" className="inline-flex items-center justify-center w-full px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-slate-900/20 group">
            Create Your Free Card
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml }} />
      <PublicCardView data={data} products={products} services={services} />
    </>
  );
}
