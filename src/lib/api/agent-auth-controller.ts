import { AgentBaseController } from "./base-controller";

/**
 * `agent/auth/*` calls the browser makes directly. The ones that hand out
 * tokens (verify, refresh, logout) go through src/app/session instead, so the
 * tokens land in httpOnly cookies — see lib/auth/session-client.ts.
 */
class AgentAuthController extends AgentBaseController {
  sendOtp(email: string): Promise<{ success: true }> {
    return this.post("/agent/auth/send-otp", { email });
  }

  resendOtp(email: string): Promise<{ success: true }> {
    return this.post("/agent/auth/resend-otp", { email });
  }
}

const controller = new AgentAuthController();

export const sendOtp = controller.sendOtp.bind(controller);
export const resendOtp = controller.resendOtp.bind(controller);
