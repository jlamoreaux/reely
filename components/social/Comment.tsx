'use client'

import React from 'react'
import Link from 'next/link'
import { Avatar, Text } from '@/components/ui'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'

export interface CommentProps {
  id: string
  user: {
    id: string
    username: string
    displayName?: string
    profileImage?: string
  }
  content: string
  likeCount: number
  isLiked?: boolean
  createdAt: number
  onLike?: () => void
  onReply?: () => void
  isReply?: boolean
}

export default function Comment({
  user,
  content,
  likeCount,
  isLiked = false,
  createdAt,
  onLike,
  onReply,
  isReply = false
}: CommentProps) {
  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    const weeks = Math.floor(days / 7)
    return `${weeks}w`
  }

  return (
    <div className={cn("flex gap-3", isReply && "ml-10 mt-3")}>
      <Link href={`/profile/${user.username}`} className="flex-shrink-0">
        <Avatar 
          size="sm" 
          src={user.profileImage}
          alt={user.displayName || user.username}
        />
      </Link>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Link href={`/profile/${user.username}`} className="inline">
              <Text size="sm" weight="semibold" className="hover:underline inline">
                {user.displayName || user.username}
              </Text>
            </Link>
            <span className="mx-1.5">
              <Text size="sm" color="secondary" className="inline">
                {content}
              </Text>
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Text size="xs" color="tertiary">
              {timeAgo(createdAt)}
            </Text>
            <button 
              onClick={onLike}
              className="flex items-center"
              aria-label="Like comment"
            >
              {isLiked ? (
                <HeartIconSolid className="w-4 h-4 text-red-500" />
              ) : (
                <HeartIcon className="w-4 h-4 text-sage-400 hover:text-red-500 transition-colors" />
              )}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-1.5">
          {onReply && (
            <button onClick={onReply}>
              <Text size="xs" color="tertiary" className="hover:text-sage-700 dark:hover:text-sage-300 transition-colors">
                Reply
              </Text>
            </button>
          )}
          
          {likeCount > 0 && (
            <Text size="xs" color="tertiary">
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </Text>
          )}
        </div>
      </div>
    </div>
  )
}