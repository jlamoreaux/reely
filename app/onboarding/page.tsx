"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "convex/react";
import AuthenticatedLayout from "@/components/layouts/AuthenticatedLayout";
import { Card, Text, Button, Input, TextArea } from "@/components/ui";

export default function Onboarding() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser);
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
    
    if (currentUser && currentUser.username) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createOrUpdateUser({
        username: username.toLowerCase().replace(/[^a-z0-9_]/g, ""),
        displayName,
        bio: bio || undefined,
      });
      router.push("/");
    } catch (err) {
      setError((err as Error).message || "Failed to create profile");
      setIsSubmitting(false);
    }
  };

  if (isLoading || (currentUser && currentUser.username)) {
    return (
      <AuthenticatedLayout className="flex items-center justify-center min-h-[80vh]">
        <Text color="tertiary">Loading...</Text>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout maxWidth="md" showHeader={false}>
      <Card className="mt-20" padding="lg">
        <div className="text-center mb-8">
          <Text as="h1" size="3xl" weight="bold" color="sage-600">Welcome to Reely!</Text>
          <Text size="lg" color="secondary" className="mt-2">Let&apos;s set up your profile</Text>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <Text as="label" size="sm" weight="medium" color="primary" className="block mb-2">
              Username
            </Text>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              required
              pattern="[a-zA-Z0-9_]+"
              minLength={3}
              maxLength={20}
            />
            <Text size="xs" color="tertiary" className="mt-1">
              Letters, numbers, and underscores only
            </Text>
          </div>

          <div>
            <Text as="label" size="sm" weight="medium" color="primary" className="block mb-2">
              Display Name
            </Text>
            <Input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="John Doe"
              required
              maxLength={50}
            />
          </div>

          <div>
            <Text as="label" size="sm" weight="medium" color="primary" className="block mb-2">
              Bio (optional)
            </Text>
            <TextArea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={150}
            />
            <Text size="xs" color="tertiary" className="mt-1">
              {bio.length}/150 characters
            </Text>
          </div>

          {error && (
            <Card variant="outlined" className="bg-red-50 border-red-200" padding="sm">
              <Text size="sm" className="text-red-600">{error}</Text>
            </Card>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !username || !displayName}
            className="w-full mt-8"
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Creating Profile..." : "Complete Setup"}
          </Button>
        </form>
      </Card>
    </AuthenticatedLayout>
  );
}