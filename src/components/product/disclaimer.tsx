import { Info } from "lucide-react";

export function Disclaimer({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <p>{children ?? "Mind Over Money provides educational insights and simulated analysis. It does not provide personalized financial advice or execute trades."}</p>
    </div>
  );
}
