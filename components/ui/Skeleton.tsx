'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'shimmer' | 'none'
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'shimmer',
}) => {
  const baseStyles = 'bg-gray-200 relative overflow-hidden'
  
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }
  
  const animations = {
    pulse: 'animate-pulse',
    shimmer: 'skeleton-shimmer',
    none: '',
  }
  
  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined),
  }
  
  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        animations[animation],
        className
      )}
      style={style}
      aria-label="Loading..."
      role="status"
    >
      {animation === 'shimmer' && (
        <div className="skeleton-shimmer-effect" />
      )}
    </div>
  )
}

export const SkeletonText: React.FC<{
  lines?: number
  className?: string
}> = ({ lines = 3, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  )
}

export const SkeletonAvatar: React.FC<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}> = ({ size = 'md', className }) => {
  const sizes = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }
  
  return (
    <Skeleton
      variant="circular"
      className={cn(sizes[size], className)}
    />
  )
}

export const SkeletonCard: React.FC<{
  className?: string
}> = ({ className }) => {
  return (
    <div className={cn('bg-white rounded-lg p-4 space-y-3', className)}>
      <div className="flex items-center space-x-3">
        <SkeletonAvatar size="sm" />
        <div className="flex-1">
          <Skeleton variant="text" width="50%" height="0.875rem" />
          <Skeleton variant="text" width="30%" height="0.75rem" className="mt-1" />
        </div>
      </div>
      <Skeleton variant="rectangular" height="200px" />
      <SkeletonText lines={2} />
      <div className="flex justify-between">
        <Skeleton variant="text" width="60px" height="0.875rem" />
        <Skeleton variant="text" width="80px" height="0.875rem" />
      </div>
    </div>
  )
}

export const SkeletonVideoCard: React.FC<{
  className?: string
}> = ({ className }) => {
  return (
    <div className={cn('bg-white rounded-lg overflow-hidden', className)}>
      <Skeleton variant="rectangular" className="aspect-[9/16]" />
      <div className="p-4 space-y-3">
        <div className="flex items-center">
          <SkeletonAvatar size="sm" />
          <div className="ml-3 flex-1">
            <Skeleton variant="text" width="60%" height="1rem" />
            <Skeleton variant="text" width="40%" height="0.875rem" className="mt-1" />
          </div>
        </div>
        <SkeletonText lines={2} />
        <div className="flex justify-between">
          <div className="flex gap-4">
            <Skeleton variant="rectangular" width="40px" height="40px" />
            <Skeleton variant="rectangular" width="40px" height="40px" />
            <Skeleton variant="rectangular" width="40px" height="40px" />
          </div>
          <Skeleton variant="rectangular" width="40px" height="40px" />
        </div>
      </div>
    </div>
  )
}

export default Skeleton