"use client";

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { HistoricalPricePoint } from "@/lib/calculations/price-history";
import type { RiskFactor } from "@/lib/calculations/risk";
import type { Asset } from "@/types";

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #dce2dd",
  borderRadius: "8px",
  color: "#18211c",
  fontSize: "12px",
  boxShadow: "0 4px 14px rgba(24,33,28,.08)",
};

export function AssetAnalysisCharts({ asset, history, riskFactors }: { asset: Asset; history: HistoricalPricePoint[]; riskFactors: RiskFactor[] }) {
  const fundamentals = [
    { name: "Fundamentals", score: asset.fundamentalScore },
    { name: "Growth", score: asset.growthScore },
    { name: "Health", score: asset.financialHealthScore },
    { name: "Valuation", score: asset.valuationScore },
  ];

  return (
    <section aria-label="Asset charts">
      <article id="overview" className="border-y border-border bg-surface py-5">
        <div className="flex items-end justify-between gap-4 px-1">
          <div><h2 className="text-lg font-semibold">Price history</h2><p className="mt-1 text-xs text-muted-foreground">30-day deterministic demo series</p></div>
          <span className="font-mono text-xs text-muted-foreground">{asset.symbol}</span>
        </div>
        <div className="mt-4 h-64 w-full" aria-label={`${asset.symbol} demo price history chart`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="#e5e8e5" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#6b746e", fontSize: 11 }} interval={4} />
              <YAxis domain={["dataMin - 20", "dataMax + 20"]} tickLine={false} axisLine={false} tick={{ fill: "#6b746e", fontSize: 11 }} width={58} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Demo price"]} />
              <Line type="monotone" dataKey="price" stroke="#176b4d" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: "#176b4d" }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="border-t border-border pt-5">
          <h3 className="text-base font-semibold">Risk factors</h3>
          <p className="mt-1 text-xs text-muted-foreground">Normalized inputs used by the transparent risk engine</p>
          <div className="mt-4 h-64 w-full" aria-label={`${asset.symbol} risk factor chart`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskFactors} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
                <CartesianGrid horizontal={false} stroke="#e5e8e5" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#6b746e", fontSize: 11 }} width={112} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}/100`, "Factor score"]} />
                <Bar dataKey="score" radius={[0, 3, 3, 0]} isAnimationActive={false} barSize={15}>
                  {riskFactors.map((factor) => <Cell key={factor.key} fill={factor.score > 80 ? "#b9382f" : factor.score > 60 ? "#c25f27" : factor.score > 30 ? "#9a6d19" : "#267a52"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="border-t border-border pt-5">
          <h3 className="text-base font-semibold">Business quality signals</h3>
          <p className="mt-1 text-xs text-muted-foreground">Comparable scores from the demo dataset</p>
          <div className="mt-4 h-64 w-full" aria-label={`${asset.symbol} business quality chart`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fundamentals} margin={{ top: 8, right: 2, bottom: 4, left: 2 }}>
                <CartesianGrid vertical={false} stroke="#e5e8e5" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#6b746e", fontSize: 11 }} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}/100`, "Score"]} />
                <Bar dataKey="score" fill="#176b4d" radius={[3, 3, 0, 0]} isAnimationActive={false} barSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  );
}
