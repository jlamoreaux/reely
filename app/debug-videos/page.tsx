"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AuthenticatedLayout from "@/components/layouts/AuthenticatedLayout";
import { Card, Text, PageContainer } from "@/components/ui";

export default function DebugVideosPage() {
  const allVideos = useQuery(api.videos.debugAllVideos);

  return (
    <AuthenticatedLayout>
      <PageContainer maxWidth="6xl">
        <Card>
        <Text as="h1" size="2xl" weight="bold" className="mb-6">
          Debug: All Videos in Database
        </Text>
        
        <div className="space-y-4">
          {allVideos?.map((video) => (
            <Card key={video._id} variant="outlined" padding="sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text size="sm" weight="medium">Video ID:</Text>
                  <Text size="xs" color="secondary" className="font-mono">{video._id}</Text>
                </div>
                
                <div>
                  <Text size="sm" weight="medium">Status:</Text>
                  <Text size="xs" color="secondary">{video.status}</Text>
                </div>
                
                <div>
                  <Text size="sm" weight="medium">Duration:</Text>
                  <Text size="xs" color="secondary">{video.duration}s</Text>
                </div>
                
                <div>
                  <Text size="sm" weight="medium">Created:</Text>
                  <Text size="xs" color="secondary">{new Date(video.createdAt).toLocaleString()}</Text>
                </div>
                
                <div className="col-span-2">
                  <Text size="sm" weight="medium">Video URL:</Text>
                  <Text size="xs" color="secondary" className="font-mono break-all">{video.videoUrl}</Text>
                </div>
                
                <div className="col-span-2">
                  <Text size="sm" weight="medium">Thumbnail URL:</Text>
                  <Text size="xs" color="secondary" className="font-mono break-all">{video.thumbnailUrl}</Text>
                </div>
                
                {video.thumbnailUrl && (
                  <div className="col-span-2">
                    <Text size="sm" weight="medium" className="mb-2">Thumbnail Preview:</Text>
                    <img 
                      src={video.thumbnailUrl} 
                      alt="Thumbnail"
                      className="w-32 h-auto rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement?.insertAdjacentHTML('beforeend', '<p class="text-red-500 text-sm">Failed to load thumbnail</p>');
                      }}
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
          
          {!allVideos?.length && (
            <Text color="tertiary">No videos found in database</Text>
          )}
        </div>
        </Card>
      </PageContainer>
    </AuthenticatedLayout>
  );
}