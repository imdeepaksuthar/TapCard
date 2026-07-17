import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://cardsetu.com';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { path: '', priority: 1 },
    { path: '/search', priority: 0.7 },
    { path: '/privacy', priority: 0.4 },
    { path: '/terms', priority: 0.4 },
    { path: '/refund', priority: 0.4 },
    { path: '/login', priority: 0.5 },
    { path: '/register', priority: 0.5 },
  ].map((r) => ({
    url: `${SITE}${r.path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: r.priority,
  }));

  let cardRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API}/api/cards/sitemap`, { cache: 'no-store' });
    if (res.ok) {
      const cards: Array<{ slug: string; updated_at: string | null }> = await res.json();
      cardRoutes = cards.map((c) => ({
        url: `${SITE}/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch {
    // If the API is unreachable at build/request time, still ship the static routes.
  }

  return [...staticRoutes, ...cardRoutes];
}
