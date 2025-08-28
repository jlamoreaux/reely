'use client'

import React from 'react'
import Image from 'next/image'
import { UserIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'

export interface AvatarProps {
  src?: string | null
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  isOnline?: boolean
  showBorder?: boolean
  className?: string
  fallbackIcon?: React.ReactNode
  onClick?: () => void
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  isOnline = false,
  showBorder = false,
  className,
  fallbackIcon,
  onClick,
}) => {
  const sizes = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }
  
  const onlineIndicatorSizes = {
    xs: 'w-2 h-2 border',
    sm: 'w-2.5 h-2.5 border',
    md: 'w-3 h-3 border-2',
    lg: 'w-4 h-4 border-2',
    xl: 'w-5 h-5 border-2',
  }
  
  const containerStyles = cn(
    'relative inline-block',
    sizes[size],
    className
  )
  
  const avatarStyles = cn(
    'rounded-full overflow-hidden flex items-center justify-center bg-[#F5F5DC]',
    sizes[size],
    showBorder && 'ring-2 ring-[#7C9885] ring-offset-2',
    onClick && 'cursor-pointer hover:opacity-90 transition-opacity'
  )
  
  return (
    <div className={containerStyles}>
      <div 
        className={avatarStyles}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes={`(max-width: 768px) ${sizes[size].split(' ')[0].substring(2)}, ${sizes[size].split(' ')[0].substring(2)}`}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-[#999999]">
            {fallbackIcon || <UserIcon className="w-1/2 h-1/2" />}
          </div>
        )}
      </div>
      
      {isOnline && (
        <span 
          className={cn(
            'absolute bottom-0 right-0 block rounded-full bg-green-500 border-white',
            onlineIndicatorSizes[size]
          )}
          aria-label="Online"
        />
      )}
    </div>
  )
}

export default Avatar