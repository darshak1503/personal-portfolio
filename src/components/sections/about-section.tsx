import { Gauge, Layers, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Profile } from "@/types/content";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";

export function AboutSection({ profile }: { profile: Profile }) {
  const facts: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Sparkles, label: "Experience", value: `${profile.yearsExperience ?? 5}+ years` },
    { icon: Layers, label: "Core stack", value: "Angular · React · TS" },
    { icon: Gauge, label: "Focus", value: "Fast, accessible UX" },
  ];

  return (
    <section id="about" className="section-shell section-padding">
      <div className="container-xl">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeading
              index="01"
              eyebrow="About"
              title="Engineer with a product-first mindset"
            />
          </div>
          <Reveal className="lg:col-span-7" x={60} y={0}>
            <div className="spot-card surface-card rounded-3xl p-6 sm:p-9">
              <p className="text-lg leading-relaxed text-slate-200 sm:text-xl">
                {profile.summary.replace(/\n+/g, " ")}
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="surface-block">
                    <Icon size={18} className="text-accent-cyan" />
                    <p className="eyebrow mt-3">{label}</p>
                    <p className="mt-1.5 text-sm font-medium text-text-primary">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
