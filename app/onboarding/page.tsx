"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "convex/react";

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
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 pt-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Reely!</h1>
        <p className="text-gray-600">Let&apos;s set up your profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium mb-2"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="johndoe"
            required
            pattern="[a-zA-Z0-9_]+"
            minLength={3}
            maxLength={20}
          />
          <p className="text-xs text-gray-500 mt-1">
            Letters, numbers, and underscores only
          </p>
        </div>

        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium mb-2"
          >
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="John Doe"
            required
            maxLength={50}
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-2">
            Bio (optional)
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Tell us about yourself..."
            rows={3}
            maxLength={150}
          />
          <p className="text-xs text-gray-500 mt-1">
            {bio.length}/150 characters
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !username || !displayName}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? "Creating Profile..." : "Complete Setup"}
        </button>
      </form>
    </div>
  );
}