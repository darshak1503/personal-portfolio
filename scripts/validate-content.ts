#!/usr/bin/env tsx
import fs from "fs";
import path from "path";
import {
  profileSchema,
  projectsFileSchema,
  siteConfigSchema,
} from "../src/lib/schemas/content";

const root = process.cwd();

function validate() {
  const files = [
    ["content/profile.json", profileSchema],
    ["content/projects.json", projectsFileSchema],
    ["content/site-config.json", siteConfigSchema],
  ] as const;

  let ok = true;
  for (const [rel, schema] of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(root, rel), "utf-8"));
      schema.parse(data);
      console.log(`✓ ${rel}`);
    } catch (e) {
      ok = false;
      console.error(`✗ ${rel}`);
      console.error(e);
    }
  }

  const resume = path.join(root, "public/resume/current-resume.pdf");
  if (!fs.existsSync(resume)) {
    console.warn("⚠ public/resume/current-resume.pdf not found");
  }

  if (!ok) process.exit(1);
}

validate();