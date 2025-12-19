"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "convex/react";
import AuthenticatedLayout from "@/components/layouts/AuthenticatedLayout";
import { Card, Text, Button, TextArea, VideoPlayer, PageContainer } from "@/components/ui";
import VideoRecorder from "@/components/video/VideoRecorder";
import ThumbnailSelector from "@/components/video/ThumbnailSelector";
import { Id } from "@/convex/_generated/dataModel";

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  
  const [step, setStep] = useState<'record' | 'thumbnail' | 'details' | 'uploading'>('record');
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [stagedVideoId, setStagedVideoId] = useState<Id<"videos"> | null>(null);
  const [videoStorageId, setVideoStorageId] = useState<string | null>(null);
  const [thumbnailStorageId, setThumbnailStorageId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const confirmVideoUpload = useMutation(api.videos.confirmVideoUpload);
  const cancelVideoUpload = useMutation(api.videos.cancelVideoUpload);

  // Handle recording complete - video is already uploaded
  const handleRecordingComplete = async (
    stagedId: Id<"videos">,
    videoStorage: string,
    thumbnailStorage: string,
    blob: Blob,
    thumbUrl: string
  ) => {
    setStagedVideoId(stagedId);
    setVideoStorageId(videoStorage);
    setThumbnailStorageId(thumbnailStorage);
    setVideoBlob(blob);
    setThumbnailUrl(thumbUrl);
    
    // Convert thumbnail URL to blob for selector
    try {
      const response = await fetch(thumbUrl);
      const thumbBlob = await response.blob();
      setThumbnailBlob(thumbBlob);
    } catch (err) {
      console.error('Failed to process thumbnail:', err);
    }
    
    setStep('thumbnail');
  };

  // Handle thumbnail selection
  const handleThumbnailSelect = (blob: Blob) => {
    setThumbnailBlob(blob);
  };

  // Handle final confirmation
  const handleConfirm = async () => {
    if (!currentUser || !stagedVideoId) {
      return;
    }

    setStep('uploading');
    setError(null);

    try {
      await confirmVideoUpload({
        stagedVideoId,
        description: description || undefined,
      });
      
      setShowToast(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      console.error('Confirm error:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish video');
      setStep('details');
    }
  };

  // Handle cancel
  const handleCancel = async () => {
    if (stagedVideoId && videoStorageId && thumbnailStorageId) {
      try {
        await cancelVideoUpload({
          stagedVideoId,
          videoStorageId,
          thumbnailStorageId,
        });
      } catch (err) {
        console.error('Failed to cancel upload:', err);
      }
    }
    router.push('/');
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <AuthenticatedLayout className="flex items-center justify-center min-h-[80vh]">
        <Text color="tertiary">Please sign in to upload videos</Text>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <PageContainer maxWidth="4xl">
        {/* Recording Step */}
        {step === 'record' && (
          <VideoRecorder
            onRecordingComplete={handleRecordingComplete}
            onCancel={handleCancel}
            minDuration={5}
            maxDuration={180}
          />
        )}

        {/* Thumbnail Selection Step */}
        {step === 'thumbnail' && videoBlob && (
          <Card padding="lg">
            <Text as="h2" size="2xl" weight="bold" className="mb-6 text-center">
              Select Thumbnail
            </Text>
            
            <ThumbnailSelector
              videoBlob={videoBlob}
              onThumbnailSelect={handleThumbnailSelect}
            />
            
            <div className="flex gap-3 mt-6 max-w-md mx-auto">
              <Button
                onClick={handleCancel}
                variant="secondary"
              >
                Cancel Upload
              </Button>
              <Button
                onClick={() => setStep('details')}
                disabled={!thumbnailBlob}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </Card>
        )}

        {/* Details Step */}
        {step === 'details' && (
          <Card padding="lg">
            <Text as="h2" size="2xl" weight="bold" className="mb-6 text-center">
              Add Details
            </Text>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Video preview */}
              <div>
                {videoBlob && (
                  <div className="max-w-sm mx-auto shadow-xl">
                    <VideoPlayer
                      src={URL.createObjectURL(videoBlob)}
                      controls
                      playsInline
                      aspectRatio="9:16"
                      fit="cover"
                      rounded
                    />
                  </div>
                )}
              </div>
              
              {/* Form */}
              <div className="flex flex-col justify-center">
                {/* Description */}
                <div className="mb-6">
                  <Text as="label" htmlFor="description" size="sm" weight="medium" className="block mb-2">
                    Description (optional)
                  </Text>
                  <TextArea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this video about?"
                    rows={4}
                    maxLength={200}
                  />
                  <Text size="xs" color="tertiary" className="mt-1">
                    {description.length}/200 characters
                  </Text>
                </div>

                {error && (
                  <Card variant="outlined" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-3 mb-4">
                    <Text size="sm" className="text-red-600 dark:text-red-400">{error}</Text>
                  </Card>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep('thumbnail')}
                    variant="secondary"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="flex-1"
                  >
                    Post Video
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Upload Progress Step */}
        {step === 'uploading' && (
          <Card padding="lg" className="text-center">
            <Text as="h2" size="2xl" weight="bold" className="mb-6">
              Publishing Video
            </Text>
            
            <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-6" />
            
            <Text color="secondary">
              Your video is being published...
            </Text>
          </Card>
        )}

        {/* Success message */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Video uploaded successfully!
          </div>
        )}
      </PageContainer>
    </AuthenticatedLayout>
  );
}