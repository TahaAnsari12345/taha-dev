# Taha Ansari | 3D Developer Portfolio

A fast, responsive, 3D interactive portfolio built with **React + Vite**, **Three.js** (`@react-three/fiber` / `drei`), **Framer Motion**, **GSAP ScrollTrigger**, **Lenis** smooth scrolling and **Tailwind CSS**. The contact form runs on a **Vercel serverless function** (Nodemailer + Gmail SMTP).

## Quick start

```bash
npm install
cp .env.example .env      # then fill in the values (see below)
npm run dev               # http://localhost:5173
```

`npm run dev` also serves `/api/contact` locally (a small dev plugin in `vite.config.js` runs `api/contact.js`), so the form works without the Vercel CLI.

```bash
npm run build             # production build -> dist/
npm run preview           # serve the build locally
```

## Add your assets

Put these in `public/`:

| File | Used for |
| --- | --- |
| `taha-portrait.webp` | About photo (800×1000, 4:5) |
| `Taha_Ansari_Resume.pdf` | The "Download Resume" button |
| `og-image.png` | Social share preview (1200×630) |

## Editing content

**All content lives in one file: [`src/data/portfolio.js`](src/data/portfolio.js)** (profile, skills, projects, experience, achievements, architecture diagram).

- **Repo URLs**: each project has `links.github` pointing at its own repository. Change that one line. An empty value hides the GitHub button (no broken link).
- **OakHire demo login**: fill `demo.email` and `demo.password`. A "Demo login" copy box appears beside the Live Demo button only when **both** are filled in.
- **Screenshots**: add `image: '/projects/oakhire.png'` to a project to replace its SVG mockup.

## Contact form: environment variables

| Variable | Purpose |
| --- | --- |
| `CONTACT_TO_EMAIL` | Private inbox that receives messages. Read only on the server. |
| `SMTP_USER` | Gmail address that sends the mail |
| `SMTP_PASS` | Gmail **App Password** (16 characters) |
| `ALLOWED_ORIGINS` | *(optional)* extra origins allowed to call the API |

The destination address is never written to the frontend, repo, logs or API responses. `.env` is git-ignored; only `.env.example` (placeholders) is committed.

## Live GitHub stats

The GitHub section reads only from `/api/github` (`api/github.js`). The function has the username fixed in code, calls the GitHub REST API, and returns followers, following, public repos, total stars, top languages and the 3 latest repos. Responses are CDN-cached for 5 minutes, and the last good result is served with `stale: true` if GitHub fails. It works without a token; set the optional `GITHUB_TOKEN` (server-side only, no scopes needed) to raise the rate limit. `npm run dev` and `vercel dev` both serve it locally.

### Create a Gmail App Password

1. Turn on **2-Step Verification** for the sending Google account: <https://myaccount.google.com/security>.
2. Open <https://myaccount.google.com/apppasswords> (search "App passwords" in your account if the link doesn't load).
3. Name it (e.g. "Portfolio") and click **Create**.
4. Copy the 16-character password into `SMTP_PASS` (spaces are fine, they're stripped).
5. Use that same Gmail address as `SMTP_USER`. Your normal Gmail password will **not** work.

### How the endpoint protects you

Zod validation (required fields, valid email, length limits), hidden honeypot field, per-IP in-memory rate limit (5 per 10 minutes), input sanitisation and HTML-escaped email template, same-origin CORS (plus `ALLOWED_ORIGINS`), and generic error messages. `replyTo` is the visitor's email, and the subject is `Portfolio message: {subject}`.

> The rate limiter is per serverless instance. That's a sensible first line of defence for a portfolio; for stricter limits add a shared store such as Upstash Redis.

## Deploy to Vercel

1. Push the repo to GitHub (confirm `.env` is **not** committed).
2. In Vercel: **Add New → Project →** import the repo. The Vite preset is auto-detected (build `npm run build`, output `dist`). The `api/` folder deploys as serverless functions automatically.
3. **Settings → Environment Variables:** add `CONTACT_TO_EMAIL`, `SMTP_USER`, `SMTP_PASS` for Production (and Preview if you want).
4. Deploy. Canonical/Open Graph URLs are filled from Vercel's production domain automatically; set `VITE_SITE_URL` (e.g. `https://yourname.dev`) to override it for a custom domain.
5. After changing env vars, **redeploy** so the function picks them up.

Via CLI: `npm i -g vercel && vercel` (use `vercel dev` if you prefer to emulate Vercel locally).

## Performance & accessibility notes

- 3D scenes are lazy-loaded after first paint, paused when scrolled off-screen, and the `three` chunk is never preloaded.
- Phones, low-memory/low-core devices and data-saver mode get a lighter scene: fewer particles, no postprocessing, lower DPR.
- `prefers-reduced-motion` disables smooth scrolling, the cursor glow, typing, parallax and the 3D animation loop.
- Sections below the fold are code-split; fonts are self-hosted via Fontsource.
- Semantic landmarks, skip link, alt text, keyboard-accessible controls and visible focus rings.

## Project structure

```
api/contact.js        Vercel serverless function (Nodemailer + Zod)
api/github.js         Live GitHub stats (cached, optional GITHUB_TOKEN)
src/data/             portfolio.js: all content
src/sections/         Hero, About, Skills, Projects, Experience, Achievements, GitHubStats, Contact
src/components/       Navbar, Loader, CursorGlow, TiltCard, ArchitectureDiagram, Toast, ...
src/three/            HeroScene, SkillsScene (React Three Fiber)
src/hooks/            theme, typing, device tier, GitHub stats, ...
```
