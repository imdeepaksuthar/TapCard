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
  const jsonLdHtml = JSON.stringify(jsonLd)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/ /g, '\\u2028')
    .replace(/ /g, '\\u2029');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml }} />
      <PublicCardView data={data} products={products} services={services} />
    </>
  );
}
