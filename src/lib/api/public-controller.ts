import { AgentBaseController } from "./base-controller";
import type {
  JobCategoryOption,
  JobsPage,
  JobsQuery,
  PublicJob,
  PublicJobDetail,
} from "./types";

export type Country = { code: string; name: string };

/** No session needed: the open-jobs feed, job categories and the geo lists. */
class PublicController extends AgentBaseController {
  listJobs(query: JobsQuery = {}): Promise<JobsPage<PublicJob>> {
    const params = this.buildSearchParams({
      page: query.page,
      limit: query.limit,
      q: query.q,
      country: query.country,
      city: query.city,
      employmentType: query.employmentTypes,
      category: query.categories,
      sort: query.sort,
    });
    return this.get(this.createURL("/public/jobs", params));
  }

  getJob(id: string): Promise<PublicJobDetail> {
    return this.get(`/public/jobs/${encodeURIComponent(id)}`);
  }

  getJobCategories(): Promise<JobCategoryOption[]> {
    return this.get("/job-categories");
  }

  getCountries(): Promise<Country[]> {
    return this.get("/public/geo/countries");
  }

  getCities(countryCode: string): Promise<string[]> {
    return this.get(
      `/public/geo/countries/${encodeURIComponent(countryCode)}/cities`,
    );
  }
}

const controller = new PublicController();

export const listPublicJobs = controller.listJobs.bind(controller);
export const getPublicJob = controller.getJob.bind(controller);
export const getJobCategories = controller.getJobCategories.bind(controller);
export const getCountries = controller.getCountries.bind(controller);
export const getCities = controller.getCities.bind(controller);
