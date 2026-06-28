/**
 * BrandMark — Tankonomics' default visual identity.
 *
 * A schematic storage-tank silhouette set against a circular gauge ring.
 * Used as the fallback whenever `theme.logoUrl` is not configured in the
 * admin settings; the existing logoUrl-based behaviour is unchanged.
 *
 * The mark scales cleanly from 16px (favicon) to 200px (splash hero).
 */
export function BrandMark({
  size = 40,
  tone = "light",
  className = "",
}: {
  size?: number;
  /** 'light' = light marks on dark surface; 'dark' = dark marks on light surface */
  tone?: "light" | "dark";
  className?: string;
}) {
  const stroke = tone === "light" ? "#f5f3ef" : "#0b1b2b";
  const accent = "#ea7317";
  const dim = tone === "light" ? "rgba(245,243,239,0.35)" : "rgba(11,27,43,0.30)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Tankonomics"
      role="img"
    >
      {/* Gauge ring — represents pressure / fill measurement */}
      <circle cx="32" cy="32" r="29" stroke={dim} strokeWidth="1.5" />
      {/* Gauge ticks — 12 marks like a process gauge */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const r1 = 29;
        const r2 = i % 3 === 0 ? 25.5 : 27.5;
        const x1 = 32 + Math.cos(angle) * r1;
        const y1 = 32 + Math.sin(angle) * r1;
        const x2 = 32 + Math.cos(angle) * r2;
        const y2 = 32 + Math.sin(angle) * r2;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={dim}
            strokeWidth={i % 3 === 0 ? 1.5 : 1}
            strokeLinecap="round"
          />
        );
      })}

      {/* Storage tank silhouette — cylindrical, with cone/dome roof */}
      {/* Unified outline: dome + body + base in one closed path */}
      <path
        d="M20 24 Q32 16 44 24 L44 44 L20 44 Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Horizontal weld bands — give the cylinder its banded look */}
      <line x1="20" y1="32" x2="44" y2="32" stroke={stroke} strokeWidth="1" opacity="0.55" />
      <line x1="20" y1="38" x2="44" y2="38" stroke={stroke} strokeWidth="1" opacity="0.55" />
      {/* Roof seam */}
      <line x1="20" y1="24" x2="44" y2="24" stroke={stroke} strokeWidth="1" opacity="0.55" />
      {/* Foundation plate — wider than tank body */}
      <line x1="16" y1="46" x2="48" y2="46" stroke={stroke} strokeWidth="2" strokeLinecap="round" />

      {/* Liquid-level indicator — the brand accent (the "fill" inside the tank) */}
      <rect x="23" y="36" width="3.5" height="7.5" fill={accent} />

      {/* Vent / inlet at apex */}
      <line x1="32" y1="18" x2="32" y2="14" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="32" cy="12.5" r="1.6" fill={stroke} />
    </svg>
  );
}

export default BrandMark;
