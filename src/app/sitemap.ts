import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.iiknalayoga.com'
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/clases`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/paquetes`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/formacion`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]
}
