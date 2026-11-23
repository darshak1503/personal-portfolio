import { z } from "zod";

const linkSchema = z.object({
  live: z.string().url().nullable(),
  github: z.string().url().nullable(),
  caseStudy: z.boolean(),
});

export const projectSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  shortDescription: z.string(),
  description: z.string(),
  problem: z.string().optional().default(""),
  solution: z.string().optional().default(""),
  impact: z.string().optional().default(""),
  technologies: z.array(z.string()),
  featured: z.boolean(),
  images: z.array(z.string()),
  links: linkSchema,
  resumeRefs: z.array(z.string()).optional().default([]),
});

export const projectsFileSchema = z.object({
  projects: z.array(projectSchema),
});

export const experienceSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().optional().default(""),
  startDate: z.string(),
  endDate: z.string().nullable(),
  current: z.boolean(),
  highlights: z.array(z.string()),
  technologies: z.array(z.string()).optional().default([]),
});

export const educationSchema = z.object({
  id: z.string().min(1),
  institution: z.string(),
  degree: z.string(),
  location: z.string().optional().default(""),
  startDate: z.string(),
  endDate: z.string(),
});

export const profileSchema = z.object({
  meta: z.object({
    lastSyncedAt: z.string().nullable(),
    sourceResume: z.string(),
    resumeHash: z.string().nullable(),
  }),
  name: z.string().min(1),
  title: z.string().min(1),
  headline: z.string(),
  summary: z.string(),
  yearsExperience: z.number().int().positive().optional(),
  specialties: z.array(z.string()),
  valueProposition: z.string(),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  skillCategories: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      skills: z.array(z.string()),
    }),
  ),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  certifications: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      issuer: z.string().optional(),
      date: z.string().optional(),
    }),
  ),
  achievements: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      date: z.string().optional(),
    }),
  ),
});

export const siteConfigSchema = z.object({
  siteName: z.string(),
  siteUrl: z.string().url(),
  description: z.string(),
  keywords: z.array(z.string()),
  ogImage: z.string(),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    linkedin: z.string(),
    github: z.string(),
    location: z.string().optional(),
  }),
  resumePath: z.string(),
  services: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      capabilities: z.array(z.string()),
      value: z.string(),
    }),
  ),
  theme: z.object({
    primaryBg: z.string(),
    secondaryBg: z.string(),
    accentBlue: z.string(),
    accentViolet: z.string(),
    accentCyan: z.string(),
  }),
});