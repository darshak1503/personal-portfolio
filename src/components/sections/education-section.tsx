import { GraduationCap } from "lucide-react";
import type { Profile } from "@/types/content";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";

export function EducationSection({ profile }: { profile: Profile }) {
  return (
    <section id="education" className="section-shell section-padding">
      <div className="container-xl">
        <SectionHeading index="05" eyebrow="Education" title="Academic background" />

        <div className="grid gap-4">
          {profile.education.map((edu, index) => (
            <Reveal key={edu.id} delay={index * 0.08}>
              <article className="spot-card surface-card flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center">
                <span className="skill-icon shrink-0">
                  <GraduationCap size={20} />
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold tracking-tight">{edu.institution}</h3>
                  <p className="mt-1 text-sm text-text-muted">{edu.degree}</p>
                  {edu.location ? (
                    <p className="mt-1 text-xs text-text-dim">{edu.location}</p>
                  ) : null}
                </div>
                <p className="eyebrow sm:text-right">
                  {edu.startDate} — {edu.endDate}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
