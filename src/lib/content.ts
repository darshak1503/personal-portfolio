import path from "path";
import fs from "fs";
import {
  profileSchema,
  projectsFileSchema,
  siteConfigSchema,
} from "@/lib/schemas/content";
import type { Profile, Project, ProjectsFile, SiteConfig } from "@/types/content";

const root = process.cwd();

function readJson<T>(relativePath: string, schema: { parse: (d: unknown) => T }): T {
  const full = path.join(root, relativePath);
  const raw = fs.readFileSync(full, "utf-8");
  return schema.parse(JSON.parse(raw));
}

export function getProfile(): Profile {
  return readJson("content/profile.json", profileSchema);
}

export function getProjectsFile(): ProjectsFile {
  return readJson("content/projects.json", projectsFileSchema);
}

export function getProjects(featuredOnly = false): Project[] {
  const { projects } = getProjectsFile();
  return featuredOnly ? projects.filter((p) => p.featured) : projects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjectsFile().projects.find((p) => p.slug === slug);
}

export function getSiteConfig(): SiteConfig {
  return readJson("content/site-config.json", siteConfigSchema);
}