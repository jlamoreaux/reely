'use client'

import React, { forwardRef, VideoHTMLAttributes, CSSProperties, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface VideoPlayerProps extends VideoHTMLAttributes<HTMLVideoElement> {
  aspectRatio?: '9:16' | '16:9' | '1:1' | '4:3' | 'auto'
  fit?: 'contain' | 'cover' | 'fill' | 'auto'
  className?: string
  containerClassName?: string
  showPlayButton?: boolean
  rounded?: boolean
  maxHeight?: string
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ 
    aspectRatio = '9:16',
    fit = 'auto',
    className,
    containerClassName,
    showPlayButton = false,
    rounded = false,
    maxHeight,
    style,
    onLoadedMetadata,
    ...props 
  }, ref) => {
    const [videoOrientation, setVideoOrientation] = useState<'portrait' | 'landscape' | null>(null)
    const [actualFit, setActualFit] = useState<'contain' | 'cover' | 'fill'>(fit === 'auto' ? 'cover' : fit)

    const aspectRatioClass = aspectRatio === 'auto' ? '' : {
      '9:16': 'aspect-[9/16]',
      '16:9': 'aspect-[16/9]',
      '1:1': 'aspect-square',
      '4:3': 'aspect-[4/3]'
    }[aspectRatio]

    const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.target as HTMLVideoElement
      const videoAspectRatio = video.videoWidth / video.videoHeight
      
      // Determine orientation
      const orientation = videoAspectRatio > 1 ? 'landscape' : 'portrait'
      setVideoOrientation(orientation)
      
      // Auto-adjust fit based on video orientation and container
      if (fit === 'auto') {
        // For landscape videos in portrait containers, use cover to fill the space
        // For portrait videos in portrait containers, use contain to show everything
        if (orientation === 'landscape' && aspectRatio === '9:16') {
          setActualFit('cover')
        } else {
          setActualFit('contain')
        }
      }
      
      // Call the original onLoadedMetadata if provided
      if (onLoadedMetadata) {
        onLoadedMetadata(e)
      }
    }

    // Override the global height: auto style
    const videoStyle: CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: actualFit,
      ...style
    }

    return (
      <div 
        className={cn(
          'relative bg-black overflow-hidden',
          aspectRatioClass,
          rounded && 'rounded-lg',
          containerClassName
        )}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <video
          ref={ref}
          className={cn(
            'absolute inset-0',
            className
          )}
          style={videoStyle}
          onLoadedMetadata={handleLoadedMetadata}
          {...props}
        />
        
        {showPlayButton && !props.controls && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-sage-700 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    )
  }
)

VideoPlayer.displayName = 'VideoPlayer'

export default VideoPlayer