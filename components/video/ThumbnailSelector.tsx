'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Text } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ThumbnailSelectorProps {
  videoBlob: Blob
  onThumbnailSelect: (thumbnailBlob: Blob) => void
  frameCount?: number
}

interface VideoFrame {
  blob: Blob
  url: string
  timestamp: number
}

export default function ThumbnailSelector({
  videoBlob,
  onThumbnailSelect,
  frameCount = 5
}: ThumbnailSelectorProps) {
  const [frames, setFrames] = useState<VideoFrame[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    extractFrames()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoBlob])

  const extractFrames = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    setIsLoading(true)
    const extractedFrames: VideoFrame[] = []

    // Create video URL
    const videoUrl = URL.createObjectURL(videoBlob)
    video.src = videoUrl

    // Wait for video metadata to load
    await new Promise((resolve) => {
      video.addEventListener('loadedmetadata', resolve, { once: true })
    })

    const duration = video.duration
    
    // Check for valid duration
    if (!isFinite(duration) || duration <= 0) {
      console.error('Invalid video duration:', duration)
      setIsLoading(false)
      URL.revokeObjectURL(videoUrl)
      return
    }
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Extract frames at regular intervals
    for (let i = 0; i < frameCount; i++) {
      const timestamp = (duration / frameCount) * i + (duration / frameCount) / 2
      
      // Seek to timestamp
      video.currentTime = timestamp
      await new Promise((resolve) => {
        video.addEventListener('seeked', resolve, { once: true })
      })

      // Draw frame to canvas
      context.drawImage(video, 0, 0)

      // Convert to blob
      await new Promise<void>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            extractedFrames.push({
              blob,
              url: URL.createObjectURL(blob),
              timestamp
            })
          }
          resolve()
        }, 'image/jpeg', 0.8)
      })
    }

    // Cleanup
    URL.revokeObjectURL(videoUrl)

    setFrames(extractedFrames)
    setIsLoading(false)

    // Select middle frame by default
    const defaultIndex = Math.floor(frameCount / 2)
    setSelectedIndex(defaultIndex)
    if (extractedFrames[defaultIndex]) {
      onThumbnailSelect(extractedFrames[defaultIndex].blob)
    }
  }

  const handleFrameSelect = (index: number) => {
    setSelectedIndex(index)
    if (frames[index]) {
      onThumbnailSelect(frames[index].blob)
    }
  }

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      frames.forEach(frame => URL.revokeObjectURL(frame.url))
    }
  }, [frames])

  return (
    <div className="space-y-4">
      {/* Hidden elements for frame extraction */}
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Selected thumbnail preview */}
      <div className="aspect-[9/16] max-w-sm mx-auto bg-black rounded-xl overflow-hidden">
        {frames[selectedIndex] && (
          <img 
            src={frames[selectedIndex].url} 
            alt="Selected thumbnail"
            className="w-full h-full object-cover"
          />
        )}
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Text color="tertiary">Extracting frames...</Text>
          </div>
        )}
      </div>

      {/* Frame selector */}
      <div className="space-y-2">
        <Text size="sm" weight="medium">Choose a thumbnail</Text>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {frames.map((frame, index) => (
            <button
              key={index}
              onClick={() => handleFrameSelect(index)}
              className={cn(
                "flex-shrink-0 w-20 aspect-[9/16] rounded-lg overflow-hidden border-2 transition-all",
                selectedIndex === index
                  ? "border-sage-600 ring-2 ring-sage-600/20"
                  : "border-transparent hover:border-sage-300"
              )}
            >
              <img
                src={frame.url}
                alt={`Frame ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}