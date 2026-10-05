import { AgentBaseController } from "./base-controller";
import type { AgentJob, AgentSelf, JobsPage, JobsQuery } from "./types";

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
}

const controller = new AgentController();

export const getMe = controller.getMe.bind(controller);
export const listAgentJobs = controller.listJobs.bind(controller);
export const getAgentJob = controller.getJob.bind(controller);
