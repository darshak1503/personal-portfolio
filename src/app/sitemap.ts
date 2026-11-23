import type { MetadataRoute } from "next";
import { getProfile, getSiteConfig } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const config = getSiteConfig();
  const profile = getProfile();
  const lastModified = profile.meta.lastSyncedAt
    ? new Date(profile.meta.lastSyncedAt)
    : undefined;

  return [
    {
      url: config.siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
