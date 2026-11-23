import { ArrowUp, Code2, Link2, Mail } from "lucide-react";
import type { Profile, SiteConfig } from "@/types/content";

export function Footer({
  profile,
  config,
}: {
  profile: Profile;
  config: SiteConfig;
}) {
  const year = profile.meta.lastSyncedAt
    ? new Date(profile.meta.lastSyncedAt).getUTCFullYear()
    : 2026;
  const socials = [
    {
      href: config.contact.linkedin,
      icon: Link2,
      label: "LinkedIn",
      show: Boolean(config.contact.linkedin),
    },
    {
      href: config.contact.github,
      icon: Code2,
      label: "GitHub",
      show: Boolean(config.contact.github),
    },
    {
      href: `mailto:${config.contact.email}`,
      icon: Mail,
      label: "Email",
      show: true,
    },
  ].filter((s) => s.show);

  return (
    <footer className="border-t border-[color:var(--line)]">
      <div className="container-xl flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold">{profile.name}</p>
          <p className="text-sm text-text-muted">{profile.title}</p>
          <p className="mt-1 text-sm text-text-dim">{config.contact.email}</p>
        </div>

        <div className="flex items-center gap-2">
          {socials.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="rounded-full border border-[color:var(--line)] p-2.5 text-text-muted transition hover:border-accent-blue/40 hover:text-text-primary"
            >
              <Icon size={16} />
            </a>
          ))}
          <a
            href="#home"
            className="rounded-full border border-[color:var(--line)] p-2.5 text-text-muted transition hover:border-accent-blue/40 hover:text-text-primary"
            aria-label="Back to top"
          >
            <ArrowUp size={16} />
          </a>
        </div>
      </div>
      <div className="border-t border-[color:var(--line)] py-4 text-center text-xs text-text-dim">
        © {year} {profile.name}
      </div>
    </footer>
  );
}