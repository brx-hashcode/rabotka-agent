import type { AgentMovement, LedgerBucket, MomoOperator } from "#/lib/api/types";

export const MOMO_OPERATOR_LABELS: Record<MomoOperator, string> = {
  MTN: "MTN MoMo",
  AIRTEL: "Airtel Money",
};

export type MovementTone = "gain" | "loss" | "neutral";

/**
 * How a wallet movement reads from the agent's side — the French twin of the
 * admin's `movementView`. Earned and released money is a gain, a cancelled
 * commission a loss; a withdrawal only moves money the agent already had.
 */
export function movementView(m: AgentMovement): { title: string; tone: MovementTone } {
  switch (m.kind) {
    case "COMMISSION_EARNED":
      return { title: "Commission gagnée", tone: "gain" };
    case "COMMISSION_RELEASED":
      return { title: "Commission disponible", tone: "gain" };
    case "COMMISSION_CANCELLED":
      return { title: "Commission annulée", tone: "loss" };
    case "WITHDRAWAL_REQUESTED":
      return { title: "Retrait demandé", tone: "neutral" };
    case "WITHDRAWAL_PAID":
      return { title: "Retrait versé", tone: "neutral" };
    case "WITHDRAWAL_REJECTED":
      return { title: "Retrait refusé", tone: "neutral" };
    case "WITHDRAWAL_CANCELLED":
      return { title: "Retrait annulé", tone: "neutral" };
    default: {
      const net = Object.values(m.moves).reduce((a, v) => a + (v ?? 0), 0);
      return {
        title: m.description ? `Ajustement — ${m.description}` : "Ajustement",
        tone: net > 0 ? "gain" : net < 0 ? "loss" : "neutral",
      };
    }
  }
}

const BUCKET_LABELS: Record<LedgerBucket, string> = {
  PENDING: "En attente",
  AVAILABLE: "Disponible",
  LOCKED: "En retrait",
  PAID_OUT: "Versé",
};

const BUCKET_ORDER: LedgerBucket[] = ["PENDING", "AVAILABLE", "LOCKED", "PAID_OUT"];

/** Where the money went: "En attente → Disponible", "→ En attente", "Disponible → retiré". */
export function movementFlow(moves: AgentMovement["moves"]): string {
  const from = BUCKET_ORDER.filter((b) => (moves[b] ?? 0) < 0).map((b) => BUCKET_LABELS[b]);
  const to = BUCKET_ORDER.filter((b) => (moves[b] ?? 0) > 0).map((b) => BUCKET_LABELS[b]);
  if (from.length === 0) return `→ ${to.join(", ")}`;
  if (to.length === 0) return `${from.join(", ")} → retiré`;
  return `${from.join(", ")} → ${to.join(", ")}`;
}
