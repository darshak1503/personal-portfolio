# Premium 3D Personal Portfolio

Data-driven portfolio for **Darshak Sondagar**, built with Next.js, React Three Fiber, and a resume synchronization engine.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Resume-driven content workflow

1. Replace `public/resume/current-resume.pdf` (or add `current-resume.docx`).
2. Run `npm run resume:sync`.
3. Review `content/.resume-sync-preview.json` and console warnings.
4. If ambiguities exist, fix the resume or run `npm run resume:sync -- --yes` after review.
5. Run `npm run resume:validate`.
6. Run `npm run build` and deploy manually.

### What sync updates

- `content/profile.json` resume-derived fields (name, title, summary, skills, experience, education, contact)
- Preserves manual fields: `headline`, `valueProposition`, experience `technologies`, curated certifications/projects

### What stays manual

- `content/projects.json` (case studies, screenshots, links)
- `content/site-config.json` (SEO, services, social URLs)
- Project images under `public/images/`

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run resume:sync` | Parse resume → preview/merge profile |
| `npm run resume:validate` | Zod validation for all content JSON |
| `npm run build` | Pre-sync (auto) + validate + production build |
| `npm run start` | Serve production build |
| `npm run test` | Resume merge/parser unit tests |

## Contact form configuration

Set **one** delivery option in `.env.local` (see `.env.example`):

- `CONTACT_WEBHOOK_URL` — POST JSON payload to your automation/CRM
- `RESEND_API_KEY` + `CONTACT_TO_EMAIL` (+ optional `CONTACT_FROM_EMAIL`)

Without configuration, the API returns a clear `503` instead of a fake success message.

## Deployment

Compatible with Vercel, Netlify, Cloudflare Pages, or any Node/static host supporting Next.js App Router.

1. Configure environment variables on the host.
2. Update `content/site-config.json` → `siteUrl`.
3. Add `public/images/og-preview.png` for social previews.
4. Run `npm run build` locally or via CI.
5. Deploy the output using your platform workflow.

## Project structure

- `content/` — JSON content layer
- `public/resume/` — source resume file
- `scripts/` — parse/validate/sync pipeline
- `src/components/` — UI + 3D sections
- `src/app/projects/[slug]` — case study routes

## Updating projects

Edit `content/projects.json`. Each project supports stable `id`/`slug`, technologies, narrative fields, and optional `links.live` / `links.github`. Re-running resume sync does **not** remove curated projects.

## Quality checks

```bash
npm run test
npm run lint
npm run build
```

## Notes

- Build runs `resume:sync --auto` but keeps existing content when ambiguities are detected.
- Dates that look inconsistent (e.g., future employment years) are flagged for manual review.