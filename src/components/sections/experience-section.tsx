"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, type Variants } from "framer-motion";
import { Building2, MapPin } from "lucide-react";
import type { Profile } from "@/types/content";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn, formatDateRange } from "@/lib/utils";

type Experience = Profile["experience"][number];

const EASE = [0.16, 1, 0.3, 1] as const;

const cardVariants: Variants = {
  hidden: (dir: number) => ({ opacity: 0, x: dir * 90, rotateY: dir * -14, scale: 0.96 }),
  show: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    scale: 1,
    transition: { duration: 0.9, ease: EASE, when: "beforeChildren", staggerChildren: 0.07 },
  },
};

const sideVariants: Variants = {
  hidden: (dir: number) => ({ opacity: 0, x: dir * -60 }),
  show: { opacity: 1, x: 0, transition: { duration: 0.9, delay: 0.15, ease: EASE } },
};

const nodeVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 380, damping: 18 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

function monthsBetween(start: string, end: string) {
  const [sy, sm = "1"] = start.split("-");
  const [ey, em = "12"] = end.split("-");
  return Math.max(1, (Number(ey) - Number(sy)) * 12 + (Number(em) - Number(sm)) + 1);
}

function formatDuration(months: number) {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [years ? `${years} yr${years > 1 ? "s" : ""}` : "", rest ? `${rest} mo` : ""];
  return parts.filter(Boolean).join(" ");
}

function cleanTitle(item: Experience) {
  return item.location ? item.title.replace(item.location, "").trim() : item.title;
}

export function ExperienceSection({ profile }: { profile: Profile }) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 55%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  // Current roles are measured against the last resume sync so prerendered output stays stable.
  const asOf = profile.meta.lastSyncedAt?.slice(0, 7);

  return (
    <section id="experience" className="section-shell section-padding">
      <div className="container-xl">
        <SectionHeading
          index="03"
          eyebrow="Experience"
          title="Career timeline"
          description="Roles across enterprise product teams, fintech systems, and AI platform delivery."
        />

        <div ref={timelineRef} className="timeline" style={{ perspective: 1200 }}>
          <div className="timeline-rail" aria-hidden />
          <motion.div
            className="timeline-rail-fill"
            aria-hidden
            style={{ scaleY: reduced ? 1 : fill }}
          />

          <ol>
            {profile.experience.map((item, index) => (
              <TimelineItem
                key={item.id}
                item={item}
                side={index % 2 === 0 ? "left" : "right"}
                asOf={asOf}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({
  item,
  side,
  asOf,
}: {
  item: Experience;
  side: "left" | "right";
  asOf?: string;
}) {
  const reduced = useReducedMotion();
  const dir = side === "left" ? -1 : 1;
  const startYear = item.startDate.slice(0, 4);
  const endLabel = item.current || !item.endDate ? "Present" : item.endDate.slice(0, 4);
  const end = item.current || !item.endDate ? asOf : item.endDate;
  const duration = end ? formatDuration(monthsBetween(item.startDate, end)) : null;

  return (
    <motion.li
      className={cn("timeline-item", `timeline-item-${side}`)}
      initial={reduced ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.3, margin: "0px 0px -8% 0px" }}
    >
      <motion.span
        className={cn("timeline-node", item.current && "timeline-node-current")}
        variants={nodeVariants}
        aria-hidden
      />

      <motion.article className="timeline-card-wrap" custom={dir} variants={cardVariants}>
        <div className="timeline-card spot-card surface-card">
          <motion.div className="flex flex-wrap items-center gap-2" variants={itemVariants}>
            <p className="eyebrow">{formatDateRange(item.startDate, item.endDate, item.current)}</p>
            {item.current ? (
              <span className="badge-current">
                <span className="status-dot" />
                Current
              </span>
            ) : null}
          </motion.div>

          <motion.h3
            className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl"
            variants={itemVariants}
          >
            {cleanTitle(item)}
          </motion.h3>

          <motion.div
            className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
            variants={itemVariants}
          >
            <span className="inline-flex items-center gap-1.5 text-accent-cyan">
              <Building2 size={14} />
              {item.company}
            </span>
            {item.location ? (
              <span className="inline-flex items-center gap-1.5 text-text-dim">
                <MapPin size={14} />
                {item.location}
              </span>
            ) : null}
          </motion.div>

          {item.highlights.length ? (
            <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-text-muted">
              {item.highlights.map((point) => (
                <motion.li key={point} className="flex gap-3" variants={itemVariants}>
                  <span
                    className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-cyan-300 to-violet-400"
                    aria-hidden
                  />
                  <span>{point}</span>
                </motion.li>
              ))}
            </ul>
          ) : null}

          {item.technologies.length ? (
            <motion.div className="mt-5 flex flex-wrap gap-2" variants={itemVariants}>
              {item.technologies.map((tech) => (
                <span key={tech} className="tag">
                  {tech}
                </span>
              ))}
            </motion.div>
          ) : null}
        </div>
      </motion.article>

      <motion.div className="timeline-side" custom={dir} variants={sideVariants} aria-hidden>
        <span className="timeline-year">{startYear}</span>
        <span className="mono-muted mt-2">→ {endLabel}</span>
        {duration ? <span className="timeline-duration">{duration}</span> : null}
      </motion.div>
    </motion.li>
  );
}
