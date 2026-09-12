const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const compactNumberFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatInr(value: number): string {
  return inrFormatter.format(value);
}

export function formatMarketCap(valueInCrore: number): string {
  return `₹${compactNumberFormatter.format(valueInCrore)} Cr`;
}

export function formatPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}
