import type { AssetHypeLevel, AssetRiskLevel } from "@/types";
import { cn } from "@/lib/utils";

const levelStyles = {
  Low: "border-success/20 bg-success/8 text-success",
  Moderate: "border-warning/20 bg-warning/8 text-warning",
  High: "border-[#c25f27]/20 bg-[#c25f27]/8 text-[#a84d1c]",
};

type LevelBadgeProps = {
  level: AssetRiskLevel | AssetHypeLevel;
  label?: string;
  className?: string;
};

export function LevelBadge({ level, label, className }: LevelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        levelStyles[level],
        className,
      )}
    >
      {label ? `${label}: ${level}` : level}
    </span>
  );
}

export const RiskBadge = LevelBadge;
