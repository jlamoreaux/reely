'use client'

import { useState, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { VideoAuthenticationService } from '@/services/videoAuthentication'

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

interface UseVideoUploadReturn {
  uploadVideo: (
    videoBlob: Blob,
    thumbnailBlob: Blob,
    duration: number,
    description: string | undefined,
    recordedAt: number
  ) => Promise<string>
  uploadProgress: UploadProgress | null
  isUploading: boolean
  error: string | null
}

export function useVideoUpload(userId: string): UseVideoUploadReturn {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const generateUploadUrl = useMutation(api.videos.generateUploadUrl)
  const createVideo = useMutation(api.videos.uploadAuthenticatedVideo)

  const uploadFile = useCallback(async (
    blob: Blob,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> => {
    // Get upload URL from Convex
    const uploadUrl = await generateUploadUrl()

    // Upload with progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          })
        }
      })

      // Handle completion
      xhr.addEventListener('load', () => {
        try {
          const result = JSON.parse(xhr.responseText)
          if (result.storageId) {
            resolve(result.storageId)
          } else {
            reject(new Error('No storage ID returned'))
          }
        } catch (err) {
          reject(new Error('Failed to parse upload response'))
        }
      })

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'))
      })

      // Start upload
      xhr.open('POST', uploadUrl)
      xhr.setRequestHeader('Content-Type', blob.type)
      xhr.send(blob)
    })
  }, [generateUploadUrl])

  const uploadVideo = useCallback(async (
    videoBlob: Blob,
    thumbnailBlob: Blob,
    duration: number,
    description: string | undefined,
    recordedAt: number
  ): Promise<string> => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(null)

    try {
      const now = Date.now()
      
      // Validate upload timing
      const timeSinceRecording = now - recordedAt
      if (timeSinceRecording > 60000) {
        throw new Error('Video must be uploaded within 60 seconds of recording')
      }

      // Generate video signature
      const signature = await VideoAuthenticationService.generateVideoSignature(
        videoBlob,
        duration,
        `${userId}-${Date.now()}`
      )

      // Upload thumbnail first
      const thumbnailStorageId = await uploadFile(thumbnailBlob)
      
      // Upload video with progress tracking
      const videoStorageId = await uploadFile(
        videoBlob,
        (progress) => setUploadProgress(progress)
      )

      // Create video record in database
      const videoId = await createVideo({
        videoStorageId,
        thumbnailStorageId,
        duration,
        description,
        metadata: {
          recordedAt,
          uploadedAt: now,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          recordingSession: signature.sessionId,
        },
        signature: {
          hash: signature.hash,
          size: signature.size,
          deviceFingerprint: signature.deviceFingerprint,
        },
      })

      // Clear video data
      if (videoBlob && URL.createObjectURL) {
        // Revoke any object URLs to free memory
        const urls = document.querySelectorAll('video[src^="blob:"], img[src^="blob:"]')
        urls.forEach(el => {
          const src = el.getAttribute('src')
          if (src?.startsWith('blob:')) {
            URL.revokeObjectURL(src)
          }
        })
      }

      return videoId
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload video'
      setError(message)
      throw new Error(message)
    } finally {
      setIsUploading(false)
    }
  }, [userId, uploadFile, createVideo])

  return {
    uploadVideo,
    uploadProgress,
    isUploading,
    error
  }
}