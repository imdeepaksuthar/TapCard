import { notFound } from 'next/navigation';
import Image from 'next/image';
import PublicCardView from './PublicCardView';

// Fetch public profile data server-side
async function getCardData(slug: string) {
  try {
    // Replace with absolute backend URL dynamically in production
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/cards/public/${slug}`, {
      next: { revalidate: 60 } // ISR for fast loading
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

export default async function PublicCardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCardData(slug);

  if (!data || !data.card) {
    notFound();
  }

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

  return <PublicCardView data={data} />;
}
