import { format, formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";

import type { EmploymentType, PaymentFlow, PublicJob } from "#/lib/api/types";

/** Mirrors the backend `EmploymentType` enum. */
export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  MISSION: "Mission",
  CDD: "CDD",
  CDI: "CDI",
  STAGE: "Stage",
};

// Read after an amount: « 15 000 FCFA la tâche ».
export const PAYMENT_FLOW_LABELS: Record<PaymentFlow, string> = {
  TASK: "la tâche",
  HOURLY: "par heure",
  DAILY: "par jour",
  MONTHLY: "par mois",
};

export function jobPlace(job: Pick<PublicJob, "city" | "countryName" | "isRemote">) {
  if (job.isRemote) return "À distance";
  return [job.city, job.countryName].filter(Boolean).join(", ") || "Lieu non précisé";
}

/** Short place for a chip: the city, or the country when no city is given. */
export function jobPlaceShort(
  job: Pick<PublicJob, "city" | "countryName" | "isRemote">,
): string {
  if (job.isRemote) return "À distance";
  return job.city ?? job.countryName ?? "Lieu non précisé";
}

export function jobStart(scheduledAt: string | null): string | null {
  if (!scheduledAt) return null;
  return `Début le ${format(new Date(scheduledAt), "d MMM yyyy", { locale: fr })}`;
}

/** Compact start date for a chip: "Dès le 12 oct.". */
export function jobStartShort(scheduledAt: string | null): string | null {
  if (!scheduledAt) return null;
  return `Dès le ${format(new Date(scheduledAt), "d MMM", { locale: fr })}`;
}

export function postedAgo(createdAt: string): string {
  return `Il y a ${formatDistanceToNowStrict(new Date(createdAt), { locale: fr })}`;
}

export function seatsLabel(seatsLeft: number): string {
  if (seatsLeft <= 0) return "Complet";
  return seatsLeft === 1 ? "1 place" : `${seatsLeft} places`;
}
