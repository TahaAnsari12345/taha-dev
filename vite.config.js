import { existsSync } from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Dev-only stand-in for Vercel: serves every api/<name>.js at /api/<name> so the contact form and
 * the wake flow work with plain `npm run dev`. (In production Vercel runs the functions itself.)
 * Variables from .env are loaded into process.env but never printed.
 */
function devApi() {
  return {
    name: 'dev-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v;

      server.middlewares.use('/api', async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        const name = url.pathname.replace(/^\/+|\/+$/g, '');
        if (!/^[a-z0-9-]+$/i.test(name) || !existsSync(`${process.cwd()}/api/${name}.js`)) return next();

        const chunks = [];
        for await (const c of req) chunks.push(c);
        const raw = Buffer.concat(chunks).toString('utf8');
        try {
          req.body = raw ? JSON.parse(raw) : {};
        } catch {
          req.body = undefined;
        }
        req.query = Object.fromEntries(url.searchParams);
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (obj) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
        };
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.js`);
          await mod.default(req, res);
        } catch {
          res.statusCode = 500;
          res.json({ ok: false, message: 'Something went wrong. Please try again later.' });
        }
      });
    },
  };
}

const resolveSite = () => {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return (process.env.VITE_SITE_URL || (vercel ? `https://${vercel}` : '')).replace(/\/$/, '');
};

/**
 * Absolute URLs for canonical / Open Graph tags, plus robots.txt and sitemap.xml.
 * Site URL = VITE_SITE_URL, else the Vercel production domain. With neither (plain local build)
 * the tags stay root-relative and no sitemap is written (a sitemap needs absolute URLs).
 */
function seo() {
  const site = resolveSite();
  return {
    name: 'seo',
    transformIndexHtml(html) {
      return html.replaceAll('__SITE_URL__', site);
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n${site ? `\nSitemap: ${site}/sitemap.xml\n` : ''}`,
      });
      if (site) {
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${site}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
        });
      } else {
        this.warn('No VITE_SITE_URL / VERCEL_PROJECT_PRODUCTION_URL set: sitemap.xml was not generated.');
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), devApi(), seo()],
  esbuild: { legalComments: 'none' }, // drops third-party license banners (they contain contact emails) from the bundle
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Shared helpers + React stay in a small vendor chunk so the heavy `three` chunk is
          // only fetched by the lazy 3D scenes (never preloaded by the entry bundle).
          if (id.includes('vite/preload-helper') || id.includes('commonjsHelpers')) return 'vendor';
          if (id.includes('node_modules')) {
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'vendor';
            if (id.includes('/three/') || id.includes('@react-three') || id.includes('postprocessing')) return 'three';
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('gsap')) return 'gsap';
          }
        },
      },
    },
  },
});
