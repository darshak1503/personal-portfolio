import { Reveal } from "@/components/motion/reveal";

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="section-head">
      <Reveal y={24}>
        <p className="section-kicker">
          <span className="section-kicker-index">{index}</span>
          {eyebrow}
        </p>
      </Reveal>
      <Reveal y={36} delay={0.08}>
        <h2 className="section-title">{title}</h2>
      </Reveal>
      {description ? (
        <Reveal y={28} delay={0.16}>
          <p className="section-desc">{description}</p>
        </Reveal>
      ) : null}
    </header>
  );
}
