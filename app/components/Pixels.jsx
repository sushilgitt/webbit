// Webbit brand primitives: the three-block logo mark, the decorative peach
// arc, and a 20-cell meter used for usage / progress displays.

export function BrandMark() {
  return (
    <span className="pp-mark" aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

// Decorative peach arc — the theme's signature shape. Positioned by the
// parent's CSS (.pp-arc), so it needs no props.
export function Arc() {
  return <span className="pp-arc" aria-hidden="true" />;
}

export function PixelMeter({ pct = 0, light = false, label }) {
  const on = Math.round(Math.min(100, Math.max(0, pct)) / 5);
  const cls = `pp-meter${light ? " pp-meter--light" : ""}${pct >= 100 ? " is-full" : ""}`;
  return (
    <div className={cls} role="img" aria-label={label || `${Math.round(pct)}%`}>
      {Array.from({ length: 20 }, (_, i) => (
        <i key={i} className={i < on ? "is-on" : undefined} />
      ))}
    </div>
  );
}
