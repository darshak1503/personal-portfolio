"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import type { Profile, SiteConfig } from "@/types/content";
import { Button } from "@/components/ui/button";

const ROLES = [
  "Frontend Developer",
  "Angular & React Engineer",
  "TypeScript Craftsman",
  "UI Performance Engineer",
];

const EASE = [0.16, 1, 0.3, 1] as const;

const charVariants: Variants = {
  hidden: { y: "110%" },
  show: (i: number) => ({
    y: "0%",
    transition: { duration: 0.9, delay: 0.25 + i * 0.035, ease: EASE },
  }),
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: EASE },
  }),
};

type TokenKind = "key" | "prop" | "str" | "bool" | "punc";
type Token = [TokenKind, string];

export function HeroSection({ profile, config }: { profile: Profile; config: SiteConfig }) {
  const reducedMotion = useReducedMotion();
  const [first, ...restParts] = profile.name.split(" ");
  const rest = restParts.join(" ");
  const years = profile.yearsExperience ?? 5;
  const companies = new Set(profile.experience.map((item) => item.company)).size;
  const skills = profile.skillCategories.reduce((sum, category) => sum + category.skills.length, 0);
  const initial = reducedMotion ? "show" : "hidden";

  const stack = profile.specialties.slice(0, 3);
  const code: Token[][] = [
    [["key", "const "], ["prop", "developer"], ["punc", " = {"]],
    [["prop", "  name"], ["punc", ": "], ["str", `"${profile.name}"`], ["punc", ","]],
    [["prop", "  role"], ["punc", ": "], ["str", '"Frontend Developer"'], ["punc", ","]],
    [
      ["prop", "  stack"],
      ["punc", ": ["],
      ...stack.flatMap((item, i): Token[] =>
        i < stack.length - 1 ? [["str", `"${item}"`], ["punc", ", "]] : [["str", `"${item}"`]],
      ),
      ["punc", "],"],
    ],
    [["prop", "  experience"], ["punc", ": "], ["str", `"${years}+ years"`], ["punc", ","]],
    [["prop", "  craft"], ["punc", ": "], ["str", '"pixel-perfect, fast UI"'], ["punc", ","]],
    [["prop", "  available"], ["punc", ": "], ["bool", "true"], ["punc", ","]],
    [["punc", "};"]],
    [],
    [["key", "export default "], ["prop", "developer"], ["punc", ";"]],
  ];

  return (
    <section id="home" className="hero">
      <div className="container-xl hero-grid">
        <div>
          <motion.div
            className="hero-meta-row"
            variants={fadeUp}
            initial={initial}
            animate="show"
            custom={0.1}
          >
            <span className="status-pill">
              <span className="status-dot" />
              Available for new opportunities
            </span>
            <span className="mono-muted">{profile.title}</span>
          </motion.div>

          <h1 className="hero-title" aria-label={profile.name}>
            <SplitLine text={first} className="hero-title-a" initial={initial} />
            {rest ? (
              <span className="hero-title-line" aria-hidden>
                <motion.span
                  className="hero-title-b"
                  variants={charVariants}
                  initial={initial}
                  animate="show"
                  custom={first.length + 1}
                >
                  {rest}
                </motion.span>
              </span>
            ) : null}
          </h1>

          <motion.p className="hero-role" variants={fadeUp} initial={initial} animate="show" custom={0.7}>
            <span className="hero-role-prompt">&gt;_</span>
            <Typewriter words={ROLES} disabled={Boolean(reducedMotion)} />
          </motion.p>

          <motion.p
            className="hero-manifesto"
            variants={fadeUp}
            initial={initial}
            animate="show"
            custom={0.85}
          >
            {profile.headline}. {profile.valueProposition}
          </motion.p>

          <motion.div className="hero-actions" variants={fadeUp} initial={initial} animate="show" custom={1}>
            <Button href="#experience">
              Explore my journey <ArrowRight size={16} />
            </Button>
            <Button href="#contact" variant="secondary">
              Let&apos;s collaborate
            </Button>
            <Button href={config.resumePath} variant="ghost">
              <Download size={16} />
              Resume
            </Button>
          </motion.div>

          <motion.dl className="hero-stats" variants={fadeUp} initial={initial} animate="show" custom={1.15}>
            <Stat value={`${years}+`} label="Years shipping" />
            <Stat value={`${companies}`} label="Product teams" />
            <Stat value={`${skills}+`} label="Tools mastered" />
          </motion.dl>
        </div>

        <motion.div
          className="hidden lg:block"
          initial={reducedMotion ? false : { opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
        >
          <div className="code-window glass-panel">
            <div className="code-window-bar">
              <span className="code-dot bg-[#f87171]" />
              <span className="code-dot bg-[#fbbf24]" />
              <span className="code-dot bg-[#34d399]" />
              <span className="code-file">developer.config.ts</span>
            </div>
            <div className="code-body">
              {code.map((line, i) => (
                <motion.div
                  key={i}
                  initial={reducedMotion ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 1 + i * 0.12, ease: EASE }}
                >
                  <span className="code-ln">{i + 1}</span>
                  {line.map(([kind, text], j) => (
                    <span key={j} className={`tk-${kind}`}>
                      {text}
                    </span>
                  ))}
                  {i === code.length - 1 ? <span className="caret" /> : null}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <a href="#about" className="hero-scroll-cue">
        <span className="scroll-mouse" />
        <span>Scroll</span>
      </a>
    </section>
  );
}

function SplitLine({
  text,
  className,
  initial,
}: {
  text: string;
  className: string;
  initial: "hidden" | "show";
}) {
  return (
    <span className="hero-title-line" aria-hidden>
      {Array.from(text).map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className={className}
          variants={charVariants}
          initial={initial}
          animate="show"
          custom={i}
        >
          {char === " " ? "\u00a0" : char}
        </motion.span>
      ))}
    </span>
  );
}

function Typewriter({ words, disabled }: { words: string[]; disabled: boolean }) {
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(disabled ? words[0].length : 0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (disabled) return;
    const word = words[index];
    let delay = deleting ? 35 : 75;
    if (!deleting && length === word.length) delay = 1800;
    if (deleting && length === 0) delay = 300;

    const timer = window.setTimeout(() => {
      if (!deleting && length === word.length) {
        setDeleting(true);
      } else if (deleting && length === 0) {
        setDeleting(false);
        setIndex((index + 1) % words.length);
      } else {
        setLength(length + (deleting ? -1 : 1));
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [deleting, disabled, index, length, words]);

  return (
    <span className="hero-role-word">
      {words[index].slice(0, length)}
      <span className="caret" aria-hidden />
    </span>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <dt className="hero-stat-label">{label}</dt>
      <dd className="hero-stat-value text-gradient order-first">{value}</dd>
    </div>
  );
}
