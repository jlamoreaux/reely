'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useCamera } from '@/hooks/useCamera'
import { Button, Text, Card, VideoPlayer } from '@/components/ui'
import { 
  VideoCameraIcon, 
  StopIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { VideoAuthenticationService } from '@/services/videoAuthentication'
import { Id } from '@/convex/_generated/dataModel'
import { compressVideo, getVideoMetadata } from '@/lib/video-compression'

interface VideoRecorderProps {
  onRecordingComplete: (stagedVideoId: Id<"videos">, videoStorageId: string, thumbnailStorageId: string, blob: Blob, thumbnailUrl: string) => void
  onCancel: () => void
  minDuration?: number // in seconds
  maxDuration?: number // in seconds
}

export default function VideoRecorder({
  onRecordingComplete,
  onCancel,
  minDuration = 5,
  maxDuration = 180 // 3 minutes
}: VideoRecorderProps) {
  const {
    hasPermission,
    isLoading,
    error,
    requestPermission,
    stream,
    switchCamera,
  } = useCamera()

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const durationRef = useRef<number>(0)
  const sessionIdRef = useRef<string>(`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  const recordingMetadataRef = useRef<{ recordedAt: number }>()
  
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null)
  const [finalDuration, setFinalDuration] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [stagedVideoData, setStagedVideoData] = useState<{
    stagedVideoId: Id<"videos">
    videoStorageId: string
    thumbnailStorageId: string
  } | null>(null)
  
  const generateUploadUrl = useMutation(api.videos.generateUploadUrl)
  const stageVideoUpload = useMutation(api.videos.stageVideoUpload)

  // Set up video preview with proper aspect ratio
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  // Process video to ensure 9:16 aspect ratio
  const processVideoBlob = async (originalBlob: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      video.src = URL.createObjectURL(originalBlob)
      video.addEventListener('loadedmetadata', () => {
        // Set canvas to 9:16 aspect ratio
        const targetWidth = 1080
        const targetHeight = 1920
        canvas.width = targetWidth
        canvas.height = targetHeight
        
        // Calculate crop dimensions to maintain 9:16 from center
        const videoAspect = video.videoWidth / video.videoHeight
        const targetAspect = targetWidth / targetHeight
        
        let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight
        
        if (videoAspect > targetAspect) {
          // Video is wider, crop sides
          sw = video.videoHeight * targetAspect
          sx = (video.videoWidth - sw) / 2
        } else {
          // Video is taller, crop top/bottom
          sh = video.videoWidth / targetAspect
          sy = (video.videoHeight - sh) / 2
        }
        
        // We'll return the original blob for now, but in production
        // you would use MediaRecorder with canvas.captureStream()
        // to create a properly cropped video
        resolve(originalBlob)
        
        URL.revokeObjectURL(video.src)
      })
    })
  }

  // Start recording
  const startRecording = useCallback(() => {
    if (!stream) return

    try {
      // Clear previous recording
      chunksRef.current = []
      durationRef.current = 0
      setRecordingDuration(0)
      recordingMetadataRef.current = { recordedAt: Date.now() }

      // Create MediaRecorder with preferred options and bitrate for compression
      const options: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp9,opus',
        bitsPerSecond: 1500000, // 1.5 Mbps for good quality/size balance
        videoBitsPerSecond: 1200000, // 1.2 Mbps for video
      }
      
      // Fallback to other formats if VP9 not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8,opus'
        options.bitsPerSecond = 1500000
        options.videoBitsPerSecond = 1200000
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm'
        options.bitsPerSecond = 1500000
      }

      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const processedBlob = await processVideoBlob(blob)
        setRecordedBlob(processedBlob)
        
        // Create blob URL for playback
        const blobUrl = URL.createObjectURL(processedBlob)
        setRecordedBlobUrl(blobUrl)
        
        // Store the final duration from ref
        setFinalDuration(durationRef.current)
        
        // Stop the camera preview
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
        
        // Generate thumbnail and start upload immediately
        generateThumbnailAndUpload(processedBlob)
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)

      // Start duration timer
      timerRef.current = setInterval(() => {
        durationRef.current++
        setRecordingDuration(durationRef.current)
        
        // Auto-stop at max duration
        if (durationRef.current >= maxDuration) {
          stopRecording()
        }
      }, 1000)
    } catch (err) {
      console.error('Failed to start recording:', err)
    }
  }, [stream, maxDuration, stopRecording])

  // Generate thumbnail and upload immediately
  const generateThumbnailAndUpload = useCallback(async (blob: Blob) => {
    setIsUploading(true)
    setUploadError(null)
    
    try {
      // Compress video before uploading
      console.log('Original video size:', (blob.size / (1024 * 1024)).toFixed(2), 'MB')
      
      // Determine quality based on original size
      let quality: 'low' | 'medium' | 'high' = 'high'
      const sizeInMB = blob.size / (1024 * 1024)
      if (sizeInMB > 50) {
        quality = 'low'
      } else if (sizeInMB > 20) {
        quality = 'medium'
      }
      
      // Compress the video
      const { blob: compressedBlob, compression } = await compressVideo(blob, { quality })
      console.log('Compressed video size:', (compressedBlob.size / (1024 * 1024)).toFixed(2), 'MB')
      console.log('Compression ratio:', compression.toFixed(1), '%')
      
      // Use compressed blob for upload and update state
      const videoToUpload = compressedBlob
      
      // Update the recorded blob to be the compressed version
      setRecordedBlob(compressedBlob)
      const compressedBlobUrl = URL.createObjectURL(compressedBlob)
      if (recordedBlobUrl) {
        URL.revokeObjectURL(recordedBlobUrl)
      }
      setRecordedBlobUrl(compressedBlobUrl)
      
      // Generate thumbnail
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      
      video.src = URL.createObjectURL(videoToUpload)
      
      const generatedThumbnailBlob = await new Promise<Blob>((resolve, reject) => {
        video.addEventListener('loadeddata', () => {
          // Set canvas to 9:16 aspect ratio for thumbnail
          canvas.width = 540 // Half of 1080 for smaller file size
          canvas.height = 960 // Half of 1920
          
          // Calculate crop for thumbnail
          const videoAspect = video.videoWidth / video.videoHeight
          const targetAspect = canvas.width / canvas.height
          
          let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight
          
          if (videoAspect > targetAspect) {
            sw = video.videoHeight * targetAspect
            sx = (video.videoWidth - sw) / 2
          } else {
            sh = video.videoWidth / targetAspect
            sy = (video.videoHeight - sh) / 2
          }
          
          // Draw cropped thumbnail
          context?.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
          
          canvas.toBlob((thumbnailBlob) => {
            if (thumbnailBlob) {
              const url = URL.createObjectURL(thumbnailBlob)
              setThumbnailUrl(url)
              setThumbnailBlob(thumbnailBlob)
              resolve(thumbnailBlob)
            } else {
              reject(new Error('Failed to generate thumbnail'))
            }
          }, 'image/jpeg', 0.8)
          
          URL.revokeObjectURL(video.src)
        })
      })
      
      if (!generatedThumbnailBlob) {
        throw new Error('Failed to generate thumbnail')
      }
      
      // Generate video signature for authentication (use compressed video)
      const signature = await VideoAuthenticationService.generateVideoSignature(
        videoToUpload,
        durationRef.current,
        sessionIdRef.current
      )
      
      // Get upload URLs
      console.log('Getting upload URLs...')
      const [videoUploadUrl, thumbnailUploadUrl] = await Promise.all([
        generateUploadUrl(),
        generateUploadUrl()
      ])
      console.log('Upload URLs obtained:', { videoUploadUrl, thumbnailUploadUrl })
      
      // Upload video and thumbnail
      const [videoResponse, thumbnailResponse] = await Promise.all([
        fetch(videoUploadUrl, {
          method: 'POST',
          body: videoToUpload,
          headers: {
            'Content-Type': videoToUpload.type
          }
        }),
        fetch(thumbnailUploadUrl, {
          method: 'POST',
          body: generatedThumbnailBlob,
          headers: {
            'Content-Type': 'image/jpeg'
          }
        })
      ])
      
      if (!videoResponse.ok || !thumbnailResponse.ok) {
        throw new Error('Failed to upload files')
      }
      
      const videoResult = await videoResponse.json()
      const thumbnailResult = await thumbnailResponse.json()
      console.log('Upload results:', { videoResult, thumbnailResult })
      
      // Stage the video upload
      const staged = await stageVideoUpload({
        videoStorageId: videoResult.storageId,
        thumbnailStorageId: thumbnailResult.storageId,
        duration: durationRef.current,
        metadata: {
          recordedAt: recordingMetadataRef.current?.recordedAt || Date.now(),
          uploadedAt: Date.now(),
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          recordingSession: sessionIdRef.current
        },
        signature: {
          hash: signature.hash,
          size: signature.size,
          deviceFingerprint: signature.deviceFingerprint
        }
      })
      
      setStagedVideoData(staged)
      console.log('Video staged successfully:', staged)
      setIsUploading(false)
    } catch (error) {
      console.error('Upload error:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      setUploadError(error instanceof Error ? error.message : 'Failed to upload video')
      setIsUploading(false)
    }
  }, [generateUploadUrl, stageVideoUpload])

  // Handle recording complete
  const handleComplete = useCallback(() => {
    if (recordedBlob && thumbnailUrl && finalDuration >= minDuration && stagedVideoData) {
      onRecordingComplete(
        stagedVideoData.stagedVideoId,
        stagedVideoData.videoStorageId,
        stagedVideoData.thumbnailStorageId,
        recordedBlob,
        thumbnailUrl
      )
    }
  }, [recordedBlob, thumbnailUrl, finalDuration, minDuration, stagedVideoData, onRecordingComplete])

  // Format duration display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Request permission on mount if needed
  useEffect(() => {
    if (hasPermission === false || hasPermission === null) {
      requestPermission()
    }
  }, [hasPermission, requestPermission])

  // Loading state
  if (isLoading) {
    return (
      <Card className="flex items-center justify-center min-h-[600px]">
        <Text color="tertiary">Setting up camera...</Text>
      </Card>
    )
  }

  // Error state
  if (error || hasPermission === false) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[600px] text-center p-8">
        <VideoCameraIcon className="w-16 h-16 text-sage-400 mb-4" />
        <Text size="lg" weight="medium" className="mb-2">Camera Access Required</Text>
        <Text color="secondary" className="mb-6 max-w-md">
          {error || 'Please allow camera access to record videos. Check your browser settings if you denied permission.'}
        </Text>
        <div className="flex gap-3">
          <Button onClick={requestPermission}>
            Try Again
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </Card>
    )
  }

  // Recording preview/capture state
  if (!recordedBlob) {
    return (
      <div className="relative max-w-4xl mx-auto">
        {/* Video preview - responsive for desktop */}
        <div className="relative aspect-[9/16] max-w-md mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover mirror"
            style={{ objectFit: 'cover' }}
          />
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <Text size="sm" weight="medium">REC</Text>
            </div>
          )}

          {/* Duration display */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full">
            <Text size="sm" weight="medium">{formatDuration(recordingDuration)}</Text>
          </div>

          {/* Switch camera button */}
          {!isRecording && (
            <Button
              onClick={switchCamera}
              variant="ghost"
              size="sm"
              className="absolute bottom-24 right-4 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Recording controls */}
        <div className="flex items-center justify-center gap-8 mt-8">
          {/* Cancel button */}
          <Button
            onClick={onCancel}
            variant="ghost"
            size="lg"
            className="rounded-full w-16 h-16"
          >
            <XMarkIcon className="w-6 h-6" />
          </Button>

          {/* Record/Stop button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "rounded-full transition-all",
              isRecording ? "w-20 h-20" : "w-24 h-24"
            )}
          >
            <div
              className={cn(
                "w-full h-full rounded-full border-4 flex items-center justify-center transition-all",
                isRecording
                  ? "border-red-600 bg-red-600"
                  : "border-red-500 bg-transparent"
              )}
            >
              {isRecording ? (
                <StopIcon className="w-8 h-8 text-white" />
              ) : (
                <div className="w-16 h-16 bg-red-500 rounded-full" />
              )}
            </div>
          </button>

          {/* Spacer for layout balance */}
          <div className="w-16 h-16" />
        </div>

        {/* Duration requirements */}
        {recordingDuration < minDuration && (
          <div className="text-center mt-4">
            <Text size="sm" color="tertiary">
              Minimum duration: {minDuration} seconds
            </Text>
          </div>
        )}
      </div>
    )
  }

  // Review recorded video
  return (
    <div className="max-w-4xl mx-auto">
      {/* Recorded video preview - responsive for desktop */}
      <div className="max-w-md mx-auto shadow-2xl">
        <VideoPlayer
          key="recorded-video"
          src={recordedBlobUrl || ''}
          controls
          autoPlay
          playsInline
          aspectRatio="9:16"
          fit="cover"
          rounded
          containerClassName="rounded-2xl"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <Button
          onClick={() => {
            // Clean up blob URLs
            if (recordedBlobUrl) {
              URL.revokeObjectURL(recordedBlobUrl)
              setRecordedBlobUrl(null)
            }
            if (thumbnailUrl) {
              URL.revokeObjectURL(thumbnailUrl)
            }
            
            setRecordedBlob(null)
            setThumbnailUrl(null)
            setRecordingDuration(0)
            setFinalDuration(0)
            durationRef.current = 0
            
            // Restore camera preview
            if (videoRef.current && stream) {
              videoRef.current.srcObject = stream
            }
          }}
          variant="secondary"
          size="lg"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Retake
        </Button>

        <Button
          onClick={handleComplete}
          size="lg"
          disabled={finalDuration < minDuration || isUploading || !stagedVideoData}
        >
          {isUploading ? 'Uploading...' : 'Continue'}
        </Button>
      </div>

      {finalDuration < minDuration && (
        <div className="text-center mt-4">
          <Text size="sm" className="text-red-600">
            Video too short. Minimum duration is {minDuration} seconds.
          </Text>
        </div>
      )}
      
      {isUploading && (
        <div className="text-center mt-4">
          <Text size="sm" color="tertiary">
            Uploading video...
          </Text>
        </div>
      )}
      
      {uploadError && (
        <div className="text-center mt-4">
          <Text size="sm" className="text-red-600">
            {uploadError}
          </Text>
        </div>
      )}
    </div>
  )
}