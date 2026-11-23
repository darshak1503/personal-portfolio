import {
  Bot,
  Cloud,
  Code2,
  GitBranch,
  Layers,
  Palette,
  Plug,
  type LucideIcon,
} from "lucide-react";
import type { Profile } from "@/types/content";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  frontend: Code2,
  "ui-styling": Palette,
  "state-management": Layers,
  "apis-backend": Plug,
  "cloud-monitoring": Cloud,
  "version-control": GitBranch,
  "ai-development-tools": Bot,
};

export function SkillsSection({ profile }: { profile: Profile }) {
  const allSkills = profile.skillCategories.flatMap((category) => category.skills);

  return (
    <section id="skills" className="section-shell section-padding">
      <div className="container-xl">
        <SectionHeading
          index="02"
          eyebrow="Skills"
          title="Production stack"
          description="Frameworks and tooling used to ship reliable, scalable product interfaces."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profile.skillCategories.map((category, index) => {
            const Icon = ICONS[category.id] ?? Code2;
            return (
              <Reveal
                key={category.id}
                delay={(index % 3) * 0.08}
                className={cn(index === 0 && "sm:col-span-2 lg:col-span-2")}
              >
                <div className="skill-card spot-card surface-card h-full">
                  <div className="flex items-center justify-between">
                    <span className="skill-icon">
                      <Icon size={20} />
                    </span>
                    <span className="mono-muted">
                      {String(category.skills.length).padStart(2, "0")} tools
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{category.label}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <span key={skill} className="tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      <div className="marquee mt-20" aria-hidden>
        <div className="marquee-track">
          {[...allSkills, ...allSkills].map((skill, i) => (
            <span key={`${skill}-${i}`} className="marquee-item">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
