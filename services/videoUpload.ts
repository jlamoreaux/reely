import { api } from '@/convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

interface VideoUploadResult {
  videoStorageId: string
  thumbnailStorageId: string
  duration: number
  metadata: VideoMetadata
}

interface VideoMetadata {
  recordedAt: number
  uploadedAt: number
  deviceInfo: DeviceInfo
  recordingSession: string
}

interface DeviceInfo {
  userAgent: string
  platform: string
  screenResolution: string
  timezone: string
}

export class VideoUploadService {
  private convexClient: ConvexHttpClient

  constructor(convexUrl: string) {
    this.convexClient = new ConvexHttpClient(convexUrl)
  }

  /**
   * Upload video with anti-upload enforcement
   * Videos must be uploaded within 60 seconds of recording
   */
  async uploadVideo(
    videoBlob: Blob,
    thumbnailBlob: Blob,
    duration: number,
    recordedAt: number,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<VideoUploadResult> {
    // Validate recording timestamp
    const now = Date.now()
    const timeSinceRecording = now - recordedAt
    
    if (timeSinceRecording > 60000) { // 60 seconds
      throw new Error('Video must be uploaded within 60 seconds of recording')
    }

    // Generate recording session ID for tracking
    const recordingSession = this.generateSessionId()
    
    // Collect device metadata for verification
    const deviceInfo = this.collectDeviceInfo()
    
    // Upload thumbnail first
    const thumbnailStorageId = await this.uploadFile(
      thumbnailBlob,
      'thumbnail',
      onProgress
    )
    
    // Upload video with progress tracking
    const videoStorageId = await this.uploadFile(
      videoBlob,
      'video',
      onProgress
    )

    // Create metadata for verification
    const metadata: VideoMetadata = {
      recordedAt,
      uploadedAt: now,
      deviceInfo,
      recordingSession
    }

    return {
      videoStorageId,
      thumbnailStorageId,
      duration,
      metadata
    }
  }

  /**
   * Upload a file to Convex storage
   */
  private async uploadFile(
    blob: Blob,
    type: 'video' | 'thumbnail',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      // Get upload URL from Convex
      const uploadUrl = await this.convexClient.mutation(
        api.videos.generateUploadUrl
      )

      // Upload with progress tracking
      const response = await this.uploadWithProgress(
        uploadUrl,
        blob,
        onProgress
      )

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const { storageId } = await response.json()
      
      if (!storageId) {
        throw new Error('No storage ID returned from upload')
      }

      return storageId
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error)
      throw error
    }
  }

  /**
   * Upload with XMLHttpRequest for progress tracking
   */
  private uploadWithProgress(
    url: string,
    blob: Blob,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<Response> {
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
        const response = new Response(xhr.response, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers({ 'Content-Type': 'application/json' })
        })
        resolve(response)
      })

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'))
      })

      // Start upload
      xhr.open('POST', url)
      xhr.setRequestHeader('Content-Type', blob.type)
      xhr.responseType = 'json'
      xhr.send(blob)
    })
  }

  /**
   * Generate unique session ID for tracking
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * Collect device information for anti-upload verification
   */
  private collectDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  /**
   * Clear any cached video data to prevent re-uploads
   */
  clearVideoData(blob: Blob, thumbnailUrl: string): void {
    // Revoke object URLs to free memory
    if (thumbnailUrl.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailUrl)
    }
    
    // Clear blob reference
    blob = new Blob([])
  }
}