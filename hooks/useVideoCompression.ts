import { useState, useCallback } from 'react'
import { compressVideo, getVideoMetadata } from '@/lib/video-compression'

interface UseVideoCompressionReturn {
  compress: (blob: Blob, quality?: 'low' | 'medium' | 'high') => Promise<Blob>
  isCompressing: boolean
  compressionProgress: number
  error: string | null
}

export function useVideoCompression(): UseVideoCompressionReturn {
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionProgress, setCompressionProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const compress = useCallback(async (
    blob: Blob,
    quality: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<Blob> => {
    setIsCompressing(true)
    setCompressionProgress(0)
    setError(null)

    try {
      // Get original metadata
      const metadata = await getVideoMetadata(blob)
      console.log('Original video metadata:', metadata)

      // Skip compression if video is already small enough
      const sizeInMB = blob.size / (1024 * 1024)
      if (sizeInMB < 10 && quality === 'high') {
        console.log('Video is already small enough, skipping compression')
        setIsCompressing(false)
        setCompressionProgress(100)
        return blob
      }

      // Compress the video
      console.log(`Compressing video (${sizeInMB.toFixed(2)}MB) with ${quality} quality...`)
      const { blob: compressedBlob, compression } = await compressVideo(blob, {
        quality,
        maxWidth: quality === 'low' ? 480 : quality === 'medium' ? 720 : 1080,
        maxHeight: quality === 'low' ? 854 : quality === 'medium' ? 1280 : 1920,
      })

      const compressedSizeMB = compressedBlob.size / (1024 * 1024)
      console.log(`Compression complete: ${sizeInMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB (${compression.toFixed(1)}% reduction)`)

      setCompressionProgress(100)
      setIsCompressing(false)
      return compressedBlob

    } catch (err) {
      console.error('Video compression failed:', err)
      setError(err instanceof Error ? err.message : 'Compression failed')
      setIsCompressing(false)
      
      // Return original blob if compression fails
      return blob
    }
  }, [])

  return {
    compress,
    isCompressing,
    compressionProgress,
    error
  }
}