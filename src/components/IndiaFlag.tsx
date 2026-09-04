const SPOKES = Array.from({ length: 24 }, (_, i) => i * (360 / 24));

export default function IndiaFlag({ className = "h-4 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 24"
      className={className}
      role="img"
      aria-label="Indian flag"
    >
      <rect width="36" height="8" y="0" fill="#FF9933" />
      <rect width="36" height="8" y="8" fill="#FFFFFF" />
      <rect width="36" height="8" y="16" fill="#138808" />
      <circle cx="18" cy="12" r="3.1" fill="none" stroke="#0B3D91" strokeWidth="0.35" />
      <circle cx="18" cy="12" r="0.5" fill="#0B3D91" />
      {SPOKES.map((deg) => (
        <line
          key={deg}
          x1="18"
          y1="12"
          x2={18 + 3.1 * Math.cos((deg * Math.PI) / 180)}
          y2={12 + 3.1 * Math.sin((deg * Math.PI) / 180)}
          stroke="#0B3D91"
          strokeWidth="0.3"
        />
      ))}
    </svg>
  );
}
