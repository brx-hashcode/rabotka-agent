import type { ApplicationStatus } from "#/lib/api/types";

/** An application's status as the agent reads it, with its chip colours. */
export const APPLICATION_STATUS: Record<ApplicationStatus, { label: string; tone: string }> = {
  PENDING: { label: "En attente", tone: "bg-chip-amber text-chip-amber-foreground" },
  VIEWED: { label: "Vue par l'employeur", tone: "bg-chip-violet text-chip-violet-foreground" },
  WAITING_PAYMENT: { label: "Acceptée", tone: "bg-chip-green text-chip-green-foreground" },
  ACCEPTED: { label: "Acceptée", tone: "bg-chip-green text-chip-green-foreground" },
  STARTED: { label: "En cours", tone: "bg-chip-green text-chip-green-foreground" },
  END: { label: "Terminée", tone: "bg-muted text-muted-foreground" },
  REJECTED: { label: "Refusée", tone: "bg-destructive/10 text-destructive" },
  CANCELLED: { label: "Annulée", tone: "bg-muted text-muted-foreground" },
};

export function applicationStatus(status: ApplicationStatus) {
  return APPLICATION_STATUS[status] ?? { label: status, tone: "bg-muted text-muted-foreground" };
}
