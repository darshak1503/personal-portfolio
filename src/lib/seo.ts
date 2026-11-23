import type { Profile, SiteConfig } from "@/types/content";

export function buildPersonJsonLd(profile: Profile, config: SiteConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    email: config.contact.email,
    url: config.siteUrl,
    description: profile.summary,
    knowsAbout: profile.specialties,
  };
}