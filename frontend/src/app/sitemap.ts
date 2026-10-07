import { MetadataRoute } from 'next';
import { env } from '@/lib/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;

  const routes = [
    '',
    '/pricing',
    '/login',
    '/signup',
    '/analyze',
    '/tailor',
    '/editor',
    '/cover-letter',
    '/reports',
    '/recruiter',
    '/copilot',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
