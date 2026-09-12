import { createEmptyPortfolio, normalizePortfolioState } from "../calculations/portfolio.ts";
import type { PaperPortfolioState } from "../../types/portfolio.ts";

export const PAPER_PORTFOLIO_STORAGE_KEY = "mind-over-money:paper-portfolio";
export const PAPER_PORTFOLIO_EVENT = "mind-over-money:paper-portfolio-change";

export function readPaperPortfolio(): PaperPortfolioState {
  if (typeof window === "undefined") return createEmptyPortfolio();
  try {
    const stored = window.localStorage.getItem(PAPER_PORTFOLIO_STORAGE_KEY);
    return normalizePortfolioState(stored ? JSON.parse(stored) : null);
  } catch {
    return createEmptyPortfolio();
  }
}

export function writePaperPortfolio(state: PaperPortfolioState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PAPER_PORTFOLIO_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(PAPER_PORTFOLIO_EVENT));
}

export function subscribeToPaperPortfolio(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", listener);
  window.addEventListener(PAPER_PORTFOLIO_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(PAPER_PORTFOLIO_EVENT, listener);
  };
}
