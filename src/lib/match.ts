/**
 * The « compatibilité » shown for a suggested worker: a label carrying the
 * meaning, the percentage the detail.
 *
 * From the backend's `matchScore` — fit only (profile similarity to the offer
 * and the trade), never proximity, freshness or reliability, which only order
 * the list. Null means there is no evidence of fit: show nothing rather than a
 * number nobody can stand behind.
 */
export type MatchBand = {
  label: "Très compatible" | "Compatible" | "Peu compatible";
  percent: number;
  tone: "high" | "mid" | "low";
};

export function matchBand(matchScore: number | null | undefined): MatchBand | null {
  if (matchScore == null || !Number.isFinite(matchScore)) return null;
  const score = Math.min(1, Math.max(0, matchScore));
  const percent = Math.round(score * 100);
  if (score >= 0.75) return { label: "Très compatible", percent, tone: "high" };
  if (score >= 0.5) return { label: "Compatible", percent, tone: "mid" };
  return { label: "Peu compatible", percent, tone: "low" };
}

export const MATCH_TONE_CLASS: Record<MatchBand["tone"], string> = {
  high: "bg-chip-green text-chip-green-foreground",
  mid: "bg-header text-header-foreground",
  low: "bg-muted text-muted-foreground",
};
