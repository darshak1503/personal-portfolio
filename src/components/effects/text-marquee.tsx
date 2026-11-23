"use client";

export function TextMarquee({ items }: { items: string[] }) {
  const track = [...items, ...items];
  return (
    <div className="marquee-shell" aria-hidden>
      <div className="marquee-track">
        {track.map((item, i) => (
          <span key={`${item}-${i}`} className="marquee-item">
            {item}
            <span className="marquee-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}