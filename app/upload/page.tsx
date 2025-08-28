"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useConvexAuth } from "convex/react";

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  const uploadVideo = useMutation(api.videos.uploadVideo);
  
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!currentUser) {
      router.push("/signin");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // In a real implementation, this would:
      // 1. Access the device camera
      // 2. Record video directly
      // 3. Upload to storage
      // 4. Create video record
      
      // For now, we'll create a mock video
      await uploadVideo({
        videoUrl: "https://example.com/video.mp4", // Placeholder
        thumbnailUrl: "https://example.com/thumb.jpg", // Placeholder
        duration: 30,
        description: description || undefined,
        deviceMetadata: {
          deviceType: "web",
          appVersion: "1.0.0",
        },
      });

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to upload video");
      setIsUploading(false);
    }
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please sign in to upload videos</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-green-600">Reely</h1>
          </Link>
          
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6">Record Video</h2>
          
          {/* Camera placeholder */}
          <div className="aspect-[9/16] max-w-sm mx-auto bg-gray-900 rounded-lg mb-6 relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <svg
                className="w-16 h-16 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-center">
                Camera recording will be implemented here.
                <br />
                Only in-app recording will be allowed.
              </p>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="What's this video about?"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/200 characters
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isUploading ? "Uploading..." : "Upload Video (Mock)"}
            </button>
            
            <Link
              href="/"
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 text-center"
            >
              Cancel
            </Link>
          </div>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            Note: In the production version, this will access your device camera
            directly. No video uploads or editing will be allowed.
          </p>
        </div>
      </div>
    </div>
  );
}