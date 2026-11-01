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
export type PaymentFlow = "TASK" | "HOURLY" | "DAILY" | "MONTHLY";

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
  /** The description's start, for the card (public list only). */
  excerpt?: string | null;
};

/** `GET agent/jobs` — the full shape, for jobs in the agent's zones (toAgentJob). */
export type AgentJob = PublicJob & {
  description: string | null;
  /** The employer's « Note complémentaire » (e.g. what to bring). */
  note?: string | null;
  amount: number | null;
  paymentFlow: PaymentFlow | null;
  address: string | null;
  quantity: number;
  status: string;
  /** "limited": their candidates were all refused, so no address or pay. */
  access: "full" | "limited";
  /** False on a job only readable from history: closed, or out of their zones. */
  canPlace: boolean;
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
  /** Ranking order only — not a percentage to show. */
  score: number;
  /** Fit for display, 0–1 (see `lib/match`); null/absent = no fit evidence. */
  matchScore?: number | null;
  lead: AgentLead | null;
};

/** `POST agent/leads/:id/reveal-phone` — logged, capped per day. */
export type PhoneReveal = {
  phone: string | null;
  directPhone: string | null;
  revealsLeftToday: number;
};

/** `POST agent/leads/:id/place` — the application created by the agent. */
export type LeadPlacement = {
  applicationId: string;
  /** True when Rabotka told the worker by WhatsApp. */
  sentToWorker: boolean;
  lead: AgentLead;
};

export type ApplicationStatus =
  | "PENDING"
  | "VIEWED"
  | "WAITING_PAYMENT"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "STARTED"
  | "END";

/** `GET agent/jobs/:id/placements` — a worker this agent placed on the job. */
export type JobPlacement = {
  applicationId: string;
  status: ApplicationStatus;
  placedAt: string;
  updatedAt: string;
  /** The lead behind it, for the phone reveal; null for very old placements. */
  leadId: string | null;
  /** "AUTO_FILL" when the post being filled closed it, not the employer. */
  rejectionSource: string | null;
  worker: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    city: string | null;
  };
  job: {
    id: string;
    title: string;
    city: string | null;
    status: string;
    /** False once the offer was deleted: nothing left to open. */
    available: boolean;
  };
  /** Decided by the commission sweep after the placement; null until then. */
  commission: PlacementCommission | null;
};

export type CommissionStatus = "PENDING" | "AVAILABLE" | "CANCELLED" | "INELIGIBLE";

export type PlacementCommission = {
  status: CommissionStatus;
  amount: number;
  availableAt: string | null;
  reason: string | null;
};

/** `GET agent/placements?group=` */
export type PlacementGroup = "active" | "ended" | "closed";

/** `POST agent/jobs/:id/worker-lookup` — a worker outside the suggestions. */
export type WorkerLookup = {
  worker: {
    id: string;
    firstName: string;
    lastInitial: string;
    avatarUrl: string | null;
    city: string | null;
  };
  /** Why they cannot be placed on this job; null when they can. */
  blocker: string | null;
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

// ── Account: stats, wallet, withdrawals ─────────────────────────────────────

/** `GET agent/stats` */
export type AgentStats = {
  placements: { total: number; thisMonth: number; active: number };
  pipeline: Record<"claimed" | "invited" | "confirmed" | "declined" | "unreachable", number>;
  calls: { total: number; last30Days: number };
  /** Confirmed over every lead worked; null before the first one. */
  conversion: number | null;
  earnings: { thisMonth: number; lastMonth: number };
  days: 30 | 90;
  timeseries: { date: string; placements: number; earned: number }[];
};

export type LedgerBucket = "PENDING" | "AVAILABLE" | "LOCKED" | "PAID_OUT";

export type LedgerKind =
  | "COMMISSION_EARNED"
  | "COMMISSION_RELEASED"
  | "COMMISSION_CANCELLED"
  | "WITHDRAWAL_REQUESTED"
  | "WITHDRAWAL_PAID"
  | "WITHDRAWAL_REJECTED"
  | "WITHDRAWAL_CANCELLED"
  | "ADJUSTMENT";

export type MomoOperator = "MTN" | "AIRTEL";

export type WithdrawalStatus = "REQUESTED" | "PAID" | "REJECTED" | "CANCELLED";

export type AgentWithdrawal = {
  id: string;
  createdAt: string;
  amount: number;
  momoPhone: string;
  momoOperator: MomoOperator;
  status: WithdrawalStatus;
  processedAt: string | null;
  providerReference: string | null;
  rejectionReason: string | null;
};

/** One ledger event: its rows grouped back together. */
export type AgentMovement = {
  id: string;
  kind: LedgerKind;
  at: string;
  /** Signed amount per bucket, e.g. { PENDING: -400, AVAILABLE: 400 }. */
  moves: Partial<Record<LedgerBucket, number>>;
  amount: number;
  description: string | null;
  commission: {
    status: CommissionStatus;
    reason: string | null;
    job: { id: string; title: string | null };
    worker: { id: string; name: string | null };
  } | null;
  withdrawal: Pick<
    AgentWithdrawal,
    "status" | "momoPhone" | "momoOperator" | "providerReference" | "rejectionReason" | "processedAt"
  > | null;
};

export type AgentBalance = {
  /** Earned, in the confirmation window. */
  pending: number;
  available: number;
  /** Held by the open withdrawal. */
  locked: number;
  paidOut: number;
  totalEarned: number;
};

export type WalletRules = {
  withdrawalMinFcfa: number;
  commissionFcfa: number;
  releaseEvent: "UNLOCKED" | "COMPLETED";
  confirmationHours: number;
};

/** `GET agent/wallet` */
export type AgentWallet = {
  balance: AgentBalance;
  movements: Paginated<AgentMovement>;
  openWithdrawal: AgentWithdrawal | null;
  rules: WalletRules;
};

export type WithdrawalRequest = {
  amount: number;
  momoOperator: MomoOperator;
  momoPhone?: string;
};

export type AgentNotificationType =
  | "COMMISSION_EARNED"
  | "COMMISSION_AVAILABLE"
  | "COMMISSION_CANCELLED"
  | "WITHDRAWAL_PAID"
  | "WITHDRAWAL_REJECTED"
  | "PLACEMENT_ACCEPTED"
  | "PLACEMENT_STARTED"
  | "PLACEMENT_COMPLETED"
  | "PLACEMENT_ENDED"
  | "NEW_JOBS_IN_ZONE"
  | "ZONES_CHANGED"
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_REACTIVATED";

/** One entry of the bell. The copy is already rendered, in French. */
export type AgentNotification = {
  id: string;
  type: AgentNotificationType;
  title: string;
  body: string;
  /** In-app path to open, or null. */
  link: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  readAt: string | null;
};

/** `GET agent/notifications` */
export type AgentNotificationsPage = Paginated<AgentNotification> & { unread: number };

/** The browser's PushSubscription.toJSON(). */
export type PushSubscriptionBody = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};
