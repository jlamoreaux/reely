/**
 * Video compression utilities for browser-based video processing
 * Uses MediaRecorder API with optimized settings for size reduction
 */

interface CompressionOptions {
  maxBitrate?: number // in bits per second
  maxWidth?: number
  maxHeight?: number
  quality?: 'low' | 'medium' | 'high'
}

const QUALITY_PRESETS = {
  low: { bitrate: 500000, videoBitsPerSecond: 400000 }, // 500kbps total, 400kbps video
  medium: { bitrate: 1000000, videoBitsPerSecond: 800000 }, // 1Mbps total, 800kbps video  
  high: { bitrate: 2500000, videoBitsPerSecond: 2000000 }, // 2.5Mbps total, 2Mbps video
} as const

/**
 * Compress a video blob using re-encoding with MediaRecorder
 */
export async function compressVideo(
  inputBlob: Blob,
  options: CompressionOptions = {}
): Promise<{ blob: Blob; compression: number }> {
  const {
    quality = 'medium',
    maxWidth = 720, // Default to 720p width
    maxHeight = 1280, // Default to 720p height (9:16)
    maxBitrate
  } = options

  const startSize = inputBlob.size

  // Create video element to load the blob
  const video = document.createElement('video')
  video.muted = true
  
  const videoUrl = URL.createObjectURL(inputBlob)
  
  return new Promise((resolve, reject) => {
    video.onloadedmetadata = async () => {
      try {
        // Calculate scaling to fit within max dimensions while maintaining aspect ratio
        const videoAspect = video.videoWidth / video.videoHeight
        const maxAspect = maxWidth / maxHeight
        
        let targetWidth = video.videoWidth
        let targetHeight = video.videoHeight
        
        if (video.videoWidth > maxWidth || video.videoHeight > maxHeight) {
          if (videoAspect > maxAspect) {
            targetWidth = maxWidth
            targetHeight = Math.round(maxWidth / videoAspect)
          } else {
            targetHeight = maxHeight
            targetWidth = Math.round(maxHeight * videoAspect)
          }
        }

        // Create canvas for resizing
        const canvas = document.createElement('canvas')
        canvas.width = targetWidth
        canvas.height = targetHeight
        const ctx = canvas.getContext('2d')!

        // Create stream from canvas
        const stream = canvas.captureStream(30) // 30 fps

        // Get audio from original video if present
        const audioStream = (video as any).captureStream()
        const audioTracks = audioStream.getAudioTracks()
        if (audioTracks.length > 0) {
          stream.addTrack(audioTracks[0])
        }

        // Set up MediaRecorder with compression settings
        const preset = QUALITY_PRESETS[quality]
        const bitrate = maxBitrate || preset.bitrate
        
        const recorderOptions: MediaRecorderOptions = {
          mimeType: 'video/webm;codecs=vp9,opus',
          bitsPerSecond: bitrate,
          videoBitsPerSecond: maxBitrate ? maxBitrate * 0.8 : preset.videoBitsPerSecond,
        }

        // Fallback mime types
        if (!MediaRecorder.isTypeSupported(recorderOptions.mimeType)) {
          recorderOptions.mimeType = 'video/webm;codecs=vp8,opus'
        }
        if (!MediaRecorder.isTypeSupported(recorderOptions.mimeType)) {
          recorderOptions.mimeType = 'video/webm'
        }

        const recorder = new MediaRecorder(stream, recorderOptions)
        const chunks: Blob[] = []

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data)
        }

        recorder.onstop = () => {
          const compressedBlob = new Blob(chunks, { type: 'video/webm' })
          const compression = ((startSize - compressedBlob.size) / startSize) * 100
          
          URL.revokeObjectURL(videoUrl)
          resolve({ blob: compressedBlob, compression })
        }

        // Start recording and play video
        recorder.start()
        video.currentTime = 0
        await video.play()

        // Draw video frames to canvas
        const drawFrame = () => {
          if (!video.paused && !video.ended) {
            ctx.drawImage(video, 0, 0, targetWidth, targetHeight)
            requestAnimationFrame(drawFrame)
          } else {
            recorder.stop()
            stream.getTracks().forEach(track => track.stop())
          }
        }
        drawFrame()

      } catch (error) {
        URL.revokeObjectURL(videoUrl)
        reject(error)
      }
    }

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl)
      reject(new Error('Failed to load video'))
    }

    video.src = videoUrl
  })
}

/**
 * Estimate video file size based on duration and quality
 */
export function estimateVideoSize(
  durationSeconds: number,
  quality: 'low' | 'medium' | 'high' = 'medium'
): number {
  const preset = QUALITY_PRESETS[quality]
  // Rough estimate: bitrate * duration / 8 (bits to bytes)
  return Math.round((preset.bitrate * durationSeconds) / 8)
}

/**
 * Get video metadata from a blob
 */
export async function getVideoMetadata(blob: Blob): Promise<{
  duration: number
  width: number
  height: number
  codec: string
}> {
  const video = document.createElement('video')
  const videoUrl = URL.createObjectURL(blob)
  
  return new Promise((resolve, reject) => {
    video.onloadedmetadata = () => {
      const duration = video.duration
      const width = video.videoWidth
      const height = video.videoHeight
      
      // Try to detect codec from mime type
      let codec = 'unknown'
      if (blob.type.includes('vp9')) codec = 'vp9'
      else if (blob.type.includes('vp8')) codec = 'vp8'
      else if (blob.type.includes('h264')) codec = 'h264'
      else if (blob.type.includes('webm')) codec = 'vp8' // default for webm
      
      URL.revokeObjectURL(videoUrl)
      resolve({ duration, width, height, codec })
    }

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl)
      reject(new Error('Failed to load video metadata'))
    }

    video.src = videoUrl
  })
}