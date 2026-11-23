import { Check } from "lucide-react";
import type { SiteConfig } from "@/types/content";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";

export function ServicesSection({ config }: { config: SiteConfig }) {
  return (
    <section id="services" className="section-shell section-padding">
      <div className="container-xl">
        <SectionHeading
          index="04"
          eyebrow="Services"
          title="How I can help your team"
          description="Hands-on frontend delivery for complex, integration-heavy products."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {config.services.map((service, index) => (
            <Reveal key={service.id} delay={(index % 2) * 0.1} x={index % 2 === 0 ? -50 : 50} y={20}>
              <article className="spot-card surface-card h-full rounded-2xl p-6 sm:p-7">
                <span className="font-mono text-xs text-text-dim">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{service.description}</p>
                <ul className="mt-5 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                  {service.capabilities.map((cap) => (
                    <li key={cap} className="flex items-start gap-2">
                      <Check size={15} className="mt-0.5 shrink-0 text-accent-cyan" />
                      {cap}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
