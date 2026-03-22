import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/error-dashboard', '/api/'],
    },
    sitemap: 'https://gitgrep.com/sitemap.xml',
  }
}