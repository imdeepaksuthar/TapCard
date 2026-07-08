import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://cardsetu.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep the app/authenticated surface out of the index.
      disallow: [
        '/dashboard/',
        '/api/',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/auth/',
      ],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
