import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://resumeiq.ai';
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
