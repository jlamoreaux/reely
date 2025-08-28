'use client'

import React from 'react'
import Image from 'next/image'
import { PlayIcon, HeartIcon, ChatBubbleOvalLeftIcon, ShareIcon, BookmarkIcon, CheckBadgeIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import Avatar from './Avatar'
import IconButton from './IconButton'
import { cn } from '@/lib/utils'

export interface VideoCardProps {
  thumbnail: string
  duration: number
  user: {
    id: string
    name: string
    username: string
    avatar?: string
    isVerified?: boolean
  }
  description?: string
  timestamp: Date | string
  stats: {
    likes: number
    comments: number
    views: number
  }
  isLiked?: boolean
  isBookmarked?: boolean
  onPlay?: () => void
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
  onBookmark?: () => void
  onUserClick?: () => void
  className?: string
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatTimestamp = (timestamp: Date | string): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 7) {
    return date.toLocaleDateString()
  } else if (days > 0) {
    return `${days}d ago`
  } else if (hours > 0) {
    return `${hours}h ago`
  } else if (minutes > 0) {
    return `${minutes}m ago`
  } else {
    return 'Just now'
  }
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

const VideoCard: React.FC<VideoCardProps> = ({
  thumbnail,
  duration,
  user,
  description,
  timestamp,
  stats,
  isLiked = false,
  isBookmarked = false,
  onPlay,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onUserClick,
  className,
}) => {
  return (
    <div className={cn('bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow', className)}>
      {/* Thumbnail Section */}
      <div className="relative aspect-[9/16] bg-gray-100 cursor-pointer group" onClick={onPlay}>
        <Image
          src={thumbnail}
          alt="Video thumbnail"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 rounded-full p-4">
            <PlayIcon className="w-8 h-8 text-[#333333]" />
          </div>
        </div>
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {formatDuration(duration)}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        {/* User Info */}
        <div className="flex items-center mb-3">
          <Avatar 
            src={user.avatar} 
            size="sm" 
            onClick={onUserClick}
            className="cursor-pointer"
          />
          <div className="ml-3 flex-1 min-w-0" onClick={onUserClick} role="button">
            <div className="flex items-center">
              <p className="font-semibold text-[#333333] truncate cursor-pointer hover:underline">
                {user.name}
              </p>
              {user.isVerified && (
                <CheckBadgeIcon className="w-4 h-4 text-[#7C9885] ml-1 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-[#999999]">@{user.username} · {formatTimestamp(timestamp)}</p>
          </div>
        </div>
        
        {/* Description */}
        {description && (
          <p className="text-[#333333] mb-3 line-clamp-2">
            {description}
          </p>
        )}
        
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-[#666666] mb-3">
          <span>{formatNumber(stats.views)} views</span>
          <div className="flex items-center gap-3">
            <span>{formatNumber(stats.likes)} likes</span>
            <span>{formatNumber(stats.comments)} comments</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onLike}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              {isLiked ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </IconButton>
            
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onComment}
              aria-label="Comment"
            >
              <ChatBubbleOvalLeftIcon className="w-5 h-5" />
            </IconButton>
            
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onShare}
              aria-label="Share"
            >
              <ShareIcon className="w-5 h-5" />
            </IconButton>
          </div>
          
          <IconButton
            variant="ghost"
            size="sm"
            onClick={onBookmark}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <BookmarkIcon className={cn("w-5 h-5", isBookmarked && "fill-current text-[#7C9885]")} />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

export default VideoCard