/** Shapes returned by rabotka-backend's agent and public endpoints. */

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export type AgentZone = { countryCode: string; city: string };

/** `GET agent/me` and the login response (toAgentSelf). */
export type AgentSelf = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  zones: AgentZone[];
};

export type EmploymentType = "MISSION" | "CDD" | "CDI" | "STAGE";
export type PaymentFlow = "HOURLY" | "DAILY" | "MONTHLY";

export type JobCategory = { id: string; name: string; slug: string };

/** `GET public/jobs` — the summary anyone may see (toPublicJob). */
export type PublicJob = {
  id: string;
  reference: string;
  title: string;
  employmentType: EmploymentType;
  scheduledAt: string | null;
  isRemote: boolean;
  countryCode: string | null;
  countryName: string | null;
  city: string | null;
  seatsLeft: number;
  createdAt: string;
  category: JobCategory | null;
};

/** `GET agent/jobs` — the full shape, for jobs in the agent's zones (toAgentJob). */
export type AgentJob = PublicJob & {
  description: string | null;
  amount: number | null;
  paymentFlow: PaymentFlow | null;
  address: string | null;
  quantity: number;
  status: string;
};

export type JobSort = "recent" | "start";

/** `GET public/jobs/:id` — the summary plus the description (toPublicJobDetail). */
export type PublicJobDetail = PublicJob & { description: string | null };

export type JobsQuery = {
  page?: number;
  limit?: number;
  q?: string;
  country?: string;
  city?: string;
  employmentTypes?: EmploymentType[];
  /** Category slugs. */
  categories?: string[];
  /** Agent feed only. */
  minAmount?: number;
  maxAmount?: number;
  sort?: JobSort;
};

/**
 * Counts for the filter sidebar; each facet ignores its own filter. Optional:
 * an older backend answers without it, and the sidebar then shows no counts.
 */
export type JobFacets = {
  employmentType: Partial<Record<EmploymentType, number>>;
  category: Record<string, number>;
  /** Agent feed only: the pay range of the jobs in the agent's zones. */
  amount?: { min: number; max: number } | null;
};

export type JobsPage<T> = Paginated<T> & { facets?: JobFacets };

/** `GET job-categories` (public). `icon` is an emoji. */
export type JobCategoryOption = JobCategory & {
  icon: string | null;
  description: string | null;
};

export type LeadStatus =
  | "SUGGESTED"
  | "CLAIMED"
  | "INVITED"
  | "CONFIRMED"
  | "DECLINED"
  | "UNREACHABLE";

export type CallOutcome =
  | "INTERESTED"
  | "CALL_BACK"
  | "NOT_AVAILABLE"
  | "NOT_INTERESTED"
  | "UNREACHABLE"
  | "WRONG_NUMBER";

/** One (job, worker) pair as this agent sees it (backend `leadView`). */
export type AgentLead = {
  id: string;
  status: LeadStatus;
  /** This agent holds a live claim. */
  mine: boolean;
  /** Nobody holds it (or a claim/invitation lapsed): it can be taken. */
  available: boolean;
  claimExpiresAt: string | null;
  invitedAt: string | null;
  inviteExpiresAt: string | null;
  inviteLapsed: boolean;
  applicationId: string | null;
  decidedAt: string | null;
  updatedAt: string;
  lastCall: { outcome: CallOutcome; note: string | null; at: string } | null;
};

/** `GET agent/jobs/:id/candidates` — no contact details (toAgentCandidate). */
export type AgentCandidate = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  description: string | null;
  city: string | null;
  reliabilityScore: number | null;
  ratingAvg: number | null;
  ratingCount: number;
  verificationStatus: string;
  categories: string[];
  /** Match score, 0–1. */
  score: number;
  lead: AgentLead | null;
};

/** `POST agent/leads/:id/reveal-phone` — logged, capped per day. */
export type PhoneReveal = {
  phone: string | null;
  directPhone: string | null;
  revealsLeftToday: number;
};

/** `POST agent/leads/:id/invite` — the placement invitation. */
export type LeadInvite = {
  inviteUrl: string;
  expiresAt: string;
  /** Plain text with the link inline — for copying into any chat. */
  message: string;
  /** The WhatsApp message as the worker receives it; the link is the button. */
  preview?: { body: string; buttonText: string; url: string };
  /** True when Rabotka itself sent the invitation to the worker by WhatsApp. */
  sentToWorker: boolean;
  /** Pre-filled wa.me link; only once this agent revealed the worker's number. */
  whatsappUrl: string | null;
  lead: AgentLead;
};
