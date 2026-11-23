import { Award } from "lucide-react";
import type { Profile } from "@/types/content";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";

export function AchievementsSection({ profile }: { profile: Profile }) {
  const items = [
    ...profile.certifications.map((cert) => ({
      id: cert.id,
      title: cert.name,
      detail: cert.issuer,
    })),
    ...profile.achievements.map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.description,
    })),
  ];
  if (!items.length) return null;

  return (
    <section className="section-shell section-padding">
      <div className="container-xl">
        <SectionHeading index="—" eyebrow="Credentials" title="Achievements & certifications" />
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, index) => (
            <Reveal key={item.id} delay={(index % 2) * 0.08}>
              <article className="spot-card glass-panel flex h-full gap-4 rounded-2xl p-5">
                <Award size={20} className="mt-0.5 shrink-0 text-accent-violet" />
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  {item.detail ? <p className="mt-1 text-sm text-text-muted">{item.detail}</p> : null}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
