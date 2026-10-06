import { describe, expect, it } from "vitest";

import type { AgentMovement } from "./api/types";
import { movementFlow, movementView } from "./movements";

const movement = (over: Partial<AgentMovement>): AgentMovement => ({
  id: "m",
  kind: "COMMISSION_EARNED",
  at: "2026-10-06T10:00:00Z",
  moves: { PENDING: 400 },
  amount: 400,
  description: null,
  commission: null,
  withdrawal: null,
  ...over,
});

describe("movementView", () => {
  it("names each kind from the agent's side", () => {
    expect(movementView(movement({}))).toEqual({ title: "Commission gagnée", tone: "gain" });
    expect(movementView(movement({ kind: "COMMISSION_CANCELLED" })).tone).toBe("loss");
    expect(movementView(movement({ kind: "WITHDRAWAL_CANCELLED" }))).toEqual({
      title: "Retrait annulé",
      tone: "neutral",
    });
  });

  it("signs an adjustment by its net effect", () => {
    const down = movement({ kind: "ADJUSTMENT", moves: { AVAILABLE: -200 }, description: "Erreur" });
    expect(movementView(down)).toEqual({ title: "Ajustement — Erreur", tone: "loss" });
  });
});

describe("movementFlow", () => {
  it("reads where the money went", () => {
    expect(movementFlow({ PENDING: 400 })).toBe("→ En attente");
    expect(movementFlow({ PENDING: -400, AVAILABLE: 400 })).toBe("En attente → Disponible");
    expect(movementFlow({ PENDING: -400 })).toBe("En attente → retiré");
  });
});
