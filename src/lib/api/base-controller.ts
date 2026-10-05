import { BaseController } from "mvc-front-sdk";
import { appConfig } from "#/config";


export class AgentBaseController extends BaseController {
  constructor() {
    super(appConfig.apiUrl);
  }
}
