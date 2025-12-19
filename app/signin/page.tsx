"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageLayout, Card, Text, Button, Input } from "@/components/ui";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  return (
    <PageLayout className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md" padding="lg">
        <div className="text-center mb-8">
          <Text as="h1" size="5xl" weight="light" color="sage-700" serif>Reely</Text>
          <Text size="base" color="tertiary" className="mt-4" weight="light">Authentic moments, real connections</Text>
        </div>
        
        <form
          className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData)
            .catch((error) => {
              setError(error.message);
            })
            .then(() => {
              router.push("/");
            });
        }}
      >
          <Input
            type="email"
            name="email"
            placeholder="Email"
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            required
          />
          <Button
            type="submit"
            className="mt-4"
          >
            {flow === "signIn" ? "Sign in" : "Sign up"}
          </Button>
          <div className="flex flex-row gap-2 justify-center mt-4">
            <Text size="sm" color="tertiary" weight="light">
              {flow === "signIn"
                ? "Don't have an account?"
                : "Already have an account?"}
            </Text>
            <Text
              as="span"
              size="sm"
              color="sage-600"
              className="hover:text-sage-700 cursor-pointer font-medium transition-colors"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            >
              {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
            </Text>
          </div>
          {error && (
            <Card variant="outlined" className="mt-4 bg-red-50 border-red-200" padding="sm">
              <Text size="sm" className="text-red-700">
                Error signing in: {error}
              </Text>
            </Card>
          )}
        </form>
      </Card>
    </PageLayout>
  );
}
