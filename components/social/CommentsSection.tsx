'use client'

import React, { useState } from 'react'
import { Card, Text, TextArea, Button } from '@/components/ui'
import Comment, { CommentProps } from './Comment'
import { useConvexAuth } from 'convex/react'

export interface CommentsSectionProps {
  videoId: string
  comments: CommentProps[]
  totalComments: number
  isLoading?: boolean
  onAddComment?: (content: string) => Promise<void>
  onLikeComment?: (commentId: string) => Promise<void>
  onLoadMore?: () => void
  hasMore?: boolean
}

export default function CommentsSection({
  videoId,
  comments,
  totalComments,
  isLoading = false,
  onAddComment,
  onLikeComment,
  onLoadMore,
  hasMore = false
}: CommentsSectionProps) {
  const { isAuthenticated } = useConvexAuth()
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !onAddComment) return

    setIsSubmitting(true)
    try {
      await onAddComment(newComment.trim())
      setNewComment('')
      setIsFocused(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Comments header */}
      <div className="pb-4 border-b border-sage-200 dark:border-sage-800">
        <Text size="sm" weight="semibold" color="secondary">
          {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
        </Text>
      </div>

      {/* Add comment form */}
      {isAuthenticated && onAddComment && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => !newComment.trim() && setIsFocused(false)}
              placeholder="Add a comment..."
              maxLength={500}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-transparent rounded-full 
                       text-sm placeholder:text-sage-500 dark:placeholder:text-sage-400
                       border border-sage-200 dark:border-sage-800
                       focus:border-sage-400 dark:focus:border-sage-600
                       focus:outline-none transition-all duration-200"
            />
            {(isFocused || newComment.trim()) && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {newComment.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewComment('')
                      setIsFocused(false)
                    }}
                    className="text-sage-400 hover:text-sage-600 text-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="text-sage-700 hover:text-sage-800 dark:text-sage-300 dark:hover:text-sage-200 font-semibold text-sm
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Comments list */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <Text size="sm" color="tertiary">
              {isAuthenticated 
                ? "No comments yet. Be the first to comment!" 
                : "No comments yet"}
            </Text>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                {...comment}
                onLike={() => onLikeComment?.(comment.id)}
              />
            ))}
            
            {hasMore && (
              <div className="text-center pt-2">
                <button
                  onClick={onLoadMore}
                  disabled={isLoading}
                  className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 text-sm font-medium"
                >
                  {isLoading ? 'Loading...' : 'View more comments'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}