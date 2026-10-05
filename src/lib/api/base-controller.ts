import { BaseController } from "mvc-front-sdk";
import { appConfig } from "#/config";

/**
 * Root of every agent API controller (one file per backend controller, as in
 * rabotka-admin's src/lib/api).
 *
 * The agent API authenticates with a bearer token, not a cookie, so admin's
 * CSRF layer has no counterpart here. The Authorization header is attached
 * once agent login lands.
 */
export class AgentBaseController extends BaseController {
  constructor() {
    super(appConfig.apiUrl);
  }
}
