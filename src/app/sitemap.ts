import type { MetadataRoute } from 'next';
import { siteUrl } from '../site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/work', '/about'].map((path) => ({ url: `${siteUrl}${path}` }));
}
