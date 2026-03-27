import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { lastLoginMethod, organization } from "better-auth/plugins";

import { db } from "@inflow/db";
import { schema } from "@inflow/db";
import { admin, member, owner } from "./auth/permissions";
import VerifyEmail from "../components/emails/verify-email";
import { OrganizationService } from "../server/services/organization.service";
import ForgotPasswordEmail from "../components/emails/reset-password";
import OrganizationInvitationEmail from "../components/emails/organization-invitation";
import { MailerService } from "../server/services/mailer.service";
import { getBaseUrl } from "./url";

const TRUSTED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://inflowanalytics.vercel.app",
  "https://inflow-api.vercel.app"
];


export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "fallback_secret_for_build",
  trustedOrigins: TRUSTED_ORIGINS,
  advanced: {
    disableOriginCheck: true, // Bypass strict origin check to handle proxied requests in development
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await MailerService.sendEmail({
        to: user.email,
        toName: user.name,
        subject: "Verify your email",
        template: VerifyEmail({ username: user.name, verifyUrl: url }),
      });
    },
    sendOnSignUp: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await MailerService.sendEmail({
        to: user.email,
        toName: user.name,
        subject: "Reset your password",
        template: ForgotPasswordEmail({
          username: user.name,
          resetUrl: url,
          userEmail: user.email,
        }),
      });
    },
    requireEmailVerification: true,
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const activeOrganization = await OrganizationService.getActiveOrganization(
            session.userId,
          );
          return {
            data: {
              ...session,
              activeOrganizationId: activeOrganization?.id,
            },
          };
        },
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [
    organization({
      sendInvitationEmail: async (data) => {
        try {
          console.log("Sending invitation email with data:", JSON.stringify(data, null, 2));
          const inviteLink = `${getBaseUrl()}/api/accept-invitation/${data.id}`;

          // Safety checks as Better Auth might not always populate inviter.user in the hook
          const invitedByUsername = data.inviter?.user?.name || "A team member";
          const invitedByEmail = data.inviter?.user?.email || "";
          const teamName = data.organization?.name || "their organization";

          await MailerService.sendEmail({
            to: data.email,
            toName: "Valued Member", // Better Auth Invitation doesn't always have a name for the invitee
            subject: `You've been invited to join ${teamName}`,
            template: OrganizationInvitationEmail({
              email: data.email,
              invitedByUsername,
              invitedByEmail,
              teamName,
              inviteLink,
            }),
          });
          console.log("Invitation email sent successfully to:", data.email);
        } catch (error) {
          console.error("Failed to send invitation email:");
          console.error(error);
        }
      },
      roles: {
        owner,
        admin,
        member,
      },
    }),
    lastLoginMethod(),
    nextCookies(),
  ],
});
