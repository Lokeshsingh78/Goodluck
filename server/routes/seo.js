import express from 'express';
import db from '../database.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';

const router = express.Router();

const BASE_URL = 'https://goodlucksociety.in';

// GET /sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    let products = [];
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('products').select('id, updated_at').eq('is_active', true);
      products = data || [];
    } else {
      products = db.prepare('SELECT id, updated_at FROM products WHERE is_active = 1').all();
    }

    const today = new Date().toISOString().split('T')[0];

    const staticUrls = [
      { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${BASE_URL}/catalog`, priority: '0.9', changefreq: 'daily' },
      { loc: `${BASE_URL}/about`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${BASE_URL}/privacy`, priority: '0.3', changefreq: 'yearly' },
      { loc: `${BASE_URL}/terms`, priority: '0.3', changefreq: 'yearly' },
      { loc: `${BASE_URL}/imprint`, priority: '0.3', changefreq: 'yearly' }
    ];

    const productUrls = products.map((p) => ({
      loc: `${BASE_URL}/product/${p.id}`,
      lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : today,
      priority: '0.8',
      changefreq: 'weekly'
    }));

    const allUrls = [...staticUrls, ...productUrls];

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : `<lastmod>${today}</lastmod>`}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemapXml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

// GET /robots.txt
router.get('/robots.txt', (req, res) => {
  const robotsTxt = `# Good Luck Society Robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /cart

# Host & Sitemap
Host: ${BASE_URL}
Sitemap: ${BASE_URL}/sitemap.xml
`;

  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

export default router;
