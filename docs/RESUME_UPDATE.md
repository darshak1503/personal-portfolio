# Resume Update Guide

## Replace resume

1. Save your latest resume as `public/resume/current-resume.pdf` (or `.docx`).
2. Run:

```bash
npm run resume:sync
```

3. Open `content/.resume-sync-preview.json` and review:
   - `changes`
   - `ambiguities`
   - `warnings`

4. If ambiguities exist, either fix the resume dates/formatting or apply intentionally:

```bash
npm run resume:sync -- --yes
```

5. Validate and preview locally:

```bash
npm run resume:validate
npm run dev
```

6. Deploy when ready:

```bash
npm run build
```

## What is preserved automatically

- `content/projects.json`
- Project images and case study copy
- `headline` and `valueProposition` in `profile.json`
- Experience-level `technologies` when already curated
- Certifications/achievements arrays if already populated

## Manual edits

Update social URLs and SEO in `content/site-config.json`.

Update services, contact defaults, and theme tokens in the same file.

Add screenshots to `public/images/projects/<slug>/` and reference paths in `projects.json`.