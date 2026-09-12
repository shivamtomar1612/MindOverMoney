const segments = [
  { label: "Low", color: "bg-success" },
  { label: "Moderate", color: "bg-warning" },
  { label: "High", color: "bg-[#c25f27]" },
  { label: "Very high", color: "bg-danger" },
];

export function RiskSpectrum({ score }: { score: number }) {
  const bounded = Math.max(0, Math.min(100, score));
  return (
    <div aria-label={`Risk score ${bounded} out of 100`}>
      <div className="relative pt-5">
        <div className="grid h-2 grid-cols-[30fr_30fr_20fr_20fr] gap-1" aria-hidden="true">
          {segments.map((segment) => <span key={segment.label} className={segment.color} />)}
        </div>
        <span className="absolute top-0 -translate-x-1/2 text-[11px] font-semibold tabular-nums" style={{ left: `${bounded}%` }}>{bounded}</span>
        <span className="absolute top-4 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-foreground bg-surface" style={{ left: `${bounded}%` }} aria-hidden="true" />
      </div>
      <div className="mt-2 grid grid-cols-[30fr_30fr_20fr_20fr] gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {segments.map((segment) => <span key={segment.label}>{segment.label}</span>)}
      </div>
    </div>
  );
}
