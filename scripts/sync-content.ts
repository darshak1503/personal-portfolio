#!/usr/bin/env tsx
import fs from "fs";
import path from "path";
import { profileSchema } from "../src/lib/schemas/content";
import type { Profile } from "../src/types/content";
import { extractResumeText } from "./lib/resume-text";
import { parseResumeText } from "./lib/parse-resume-content";
import { mergeProfile } from "./lib/merge-content";

const root = process.cwd();
const resumeDir = path.join(root, "public/resume");
const profilePath = path.join(root, "content/profile.json");
const previewPath = path.join(root, "content/.resume-sync-preview.json");

const args = process.argv.slice(2);
const autoApply = args.includes("--auto") || args.includes("--yes");
const dryRun = args.includes("--dry-run");

function findResumeFile(): string {
  const preferred = path.join(resumeDir, "current-resume.pdf");
  if (fs.existsSync(preferred)) return preferred;
  const docx = path.join(resumeDir, "current-resume.docx");
  if (fs.existsSync(docx)) return docx;
  const files = fs
    .readdirSync(resumeDir)
    .filter((f) => /\.(pdf|docx)$/i.test(f));
  if (files.length === 0) {
    throw new Error(
      "No resume found in public/resume/. Add current-resume.pdf or current-resume.docx",
    );
  }
  return path.join(resumeDir, files[0]);
}

async function main() {
  const resumePath = findResumeFile();
  const existing = profileSchema.parse(
    JSON.parse(fs.readFileSync(profilePath, "utf-8")),
  );

  const { text, hash } = await extractResumeText(resumePath);
  if (existing.meta.resumeHash === hash) {
    console.log("Resume unchanged (hash match). Skipping sync.");
    return;
  }

  const { extracted, ambiguities, warnings } = parseResumeText(text);
  const merged = mergeProfile(existing, {
    ...extracted,
    meta: {
      ...existing.meta,
      sourceResume: path.relative(root, resumePath),
      resumeHash: hash,
      lastSyncedAt: new Date().toISOString(),
    },
  });

  const preview = {
    generatedAt: new Date().toISOString(),
    resumePath: path.relative(root, resumePath),
    resumeHash: hash,
    ambiguities,
    warnings,
    changes: diffSummary(existing, merged),
    nextProfile: merged,
  };

  fs.writeFileSync(previewPath, JSON.stringify(preview, null, 2));
  console.log(`Preview written to ${path.relative(root, previewPath)}`);

  if (ambiguities.length) {
    console.log("\nAmbiguities (review before applying):");
    ambiguities.forEach((a) => console.log(`  - ${a}`));
  }
  if (warnings.length) {
    console.log("\nWarnings:");
    warnings.forEach((w) => console.log(`  - ${w}`));
  }
  if (preview.changes.length) {
    console.log("\nDetected changes:");
    preview.changes.forEach((c) => console.log(`  - ${c}`));
  }

  if (dryRun) {
    console.log("\nDry run only — profile.json not updated.");
    return;
  }

  if (ambiguities.length && !autoApply) {
    console.log(
      "\nSync paused: ambiguous data detected. Re-run with --yes after reviewing the preview, or fix resume dates manually.",
    );
    process.exitCode = 2;
    return;
  }

  profileSchema.parse(merged);
  fs.writeFileSync(profilePath, JSON.stringify(merged, null, 2));
  console.log("\nprofile.json updated successfully.");
}

function diffSummary(before: Profile, after: Profile) {
  const changes: string[] = [];
  if (before.name !== after.name) changes.push(`Name: ${before.name} → ${after.name}`);
  if (before.title !== after.title) changes.push(`Title: ${before.title} → ${after.title}`);
  if (before.summary !== after.summary) changes.push("Summary updated");
  if (before.experience.length !== after.experience.length) {
    changes.push(
      `Experience count: ${before.experience.length} → ${after.experience.length}`,
    );
  }
  if (JSON.stringify(before.skillCategories) !== JSON.stringify(after.skillCategories)) {
    changes.push("Skills updated");
  }
  return changes;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});