import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      // Configure password requirements
      id: "password",
      // Optionally add password validation rules
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
        };
      },
    }),
    // Note: Social providers would be added here when API keys are available
    // Examples:
    // Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
    // GitHub({ clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET! }),
    // Apple({ clientId: process.env.APPLE_CLIENT_ID!, clientSecret: process.env.APPLE_CLIENT_SECRET! }),
  ],
});