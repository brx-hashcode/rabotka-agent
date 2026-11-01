/** A job's status as the agent reads it, with its chip colours. */
const JOB_STATUS: Record<string, { label: string; tone: string }> = {
  ACTIVE: { label: "Ouverte", tone: "bg-chip-green text-chip-green-foreground" },
  PARTIALLY_FILLED: { label: "En partie pourvue", tone: "bg-chip-green text-chip-green-foreground" },
  FILLED: { label: "Pourvue", tone: "bg-chip-violet text-chip-violet-foreground" },
  IN_PROGRESS: { label: "En cours", tone: "bg-chip-violet text-chip-violet-foreground" },
  COMPLETED: { label: "Terminée", tone: "bg-muted text-muted-foreground" },
  EXPIRED: { label: "Expirée", tone: "bg-muted text-muted-foreground" },
  CANCELLED: { label: "Annulée", tone: "bg-muted text-muted-foreground" },
};

export function jobStatus(status: string) {
  return JOB_STATUS[status] ?? { label: status, tone: "bg-muted text-muted-foreground" };
}
