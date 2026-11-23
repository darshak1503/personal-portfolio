import type { z } from "zod";
import {
  profileSchema,
  projectsFileSchema,
  siteConfigSchema,
} from "@/lib/schemas/content";

export type Profile = z.infer<typeof profileSchema>;
export type ProjectsFile = z.infer<typeof projectsFileSchema>;
export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type Project = ProjectsFile["projects"][number];
export type Experience = Profile["experience"][number];