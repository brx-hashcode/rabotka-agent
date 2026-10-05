import { AgentBaseController } from "./base-controller";
import type {
  AgentCandidate,
  AgentJob,
  AgentLead,
  AgentSelf,
  CallOutcome,
  JobsPage,
  LeadInvite,
  JobsQuery,
  PhoneReveal,
} from "./types";

/** `agent/*` — the signed-in agent's own data, limited to their zones. */
class AgentController extends AgentBaseController {
  getMe(): Promise<AgentSelf> {
    return this.get("/agent/me");
  }

  listJobs(query: JobsQuery = {}): Promise<JobsPage<AgentJob>> {
    const params = this.buildSearchParams({
      page: query.page,
      limit: query.limit,
      q: query.q,
      employmentType: query.employmentTypes,
      category: query.categories,
      minAmount: query.minAmount,
      maxAmount: query.maxAmount,
      sort: query.sort,
    });
    return this.get(this.createURL("/agent/jobs", params));
  }

  getJob(id: string): Promise<AgentJob> {
    return this.get(`/agent/jobs/${encodeURIComponent(id)}`);
  }

  /** Suggested workers for a job, best first; creates their leads. */
  getCandidates(jobId: string, limit = 20): Promise<AgentCandidate[]> {
    return this.get(`/agent/jobs/${encodeURIComponent(jobId)}/candidates?limit=${limit}`);
  }

  /** Take charge of a worker. 409 when another agent holds them. */
  claimLead(leadId: string): Promise<AgentLead> {
    return this.post(`/agent/leads/${encodeURIComponent(leadId)}/claim`);
  }

  /** The worker's numbers — claimer only, logged, daily cap (429). */
  revealPhone(leadId: string): Promise<PhoneReveal> {
    return this.post(`/agent/leads/${encodeURIComponent(leadId)}/reveal-phone`);
  }

  /** Issue (or re-issue) the invitation that places the worker on the job. */
  inviteLead(leadId: string): Promise<LeadInvite> {
    return this.post(`/agent/leads/${encodeURIComponent(leadId)}/invite`);
  }

  logCall(leadId: string, outcome: CallOutcome, note?: string): Promise<AgentLead> {
    return this.post(`/agent/leads/${encodeURIComponent(leadId)}/calls`, {
      outcome,
      ...(note ? { note } : {}),
    });
  }
}

const controller = new AgentController();

export const getMe = controller.getMe.bind(controller);
export const listAgentJobs = controller.listJobs.bind(controller);
export const getAgentJob = controller.getJob.bind(controller);
export const getCandidates = controller.getCandidates.bind(controller);
export const claimLead = controller.claimLead.bind(controller);
export const revealPhone = controller.revealPhone.bind(controller);
export const logCall = controller.logCall.bind(controller);
export const inviteLead = controller.inviteLead.bind(controller);
