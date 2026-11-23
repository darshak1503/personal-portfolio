import Link from "next/link";
import type { Profile, SiteConfig } from "@/types/content";

export function TopBar({
  profile,
  config,
}: {
  profile: Profile;
  config: SiteConfig;
}) {
  return (
    <header className="top-bar">
      <div className="container-xl top-bar-inner">
        <Link href="#home" className="top-brand">
          <span className="top-brand-mark" aria-hidden>
            {profile.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </span>
          {profile.name}
        </Link>
        <div className="top-actions">
          <a href={`mailto:${config.contact.email}`} className="top-email">
            {config.contact.email}
          </a>
          <Link href={config.resumePath} className="top-resume">
            Resume
          </Link>
        </div>
      </div>
    </header>
  );
}