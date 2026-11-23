export function AmbientBackground() {
  return (
    <div aria-hidden className="ambient-root pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="ambient-orb ambient-orb-c" />
      <div className="ambient-noise" />
    </div>
  );
}