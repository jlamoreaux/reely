'use client'

import React from 'react'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import IconButton from './IconButton'
import { cn } from '@/lib/utils'

export interface HeaderProps {
  title?: string
  subtitle?: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  onBack?: () => void
  showBackButton?: boolean
  className?: string
  transparent?: boolean
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  onBack,
  showBackButton = false,
  className,
  transparent = false,
}) => {
  const headerStyles = cn(
    'h-14 md:h-16 px-4 flex items-center justify-between',
    transparent ? 'bg-transparent' : 'bg-[#F5F5DC] border-b border-[#E0E0E0]',
    className
  )
  
  return (
    <header className={headerStyles}>
      <div className="flex items-center min-w-0 flex-1">
        {(showBackButton || leftAction) && (
          <div className="mr-3">
            {showBackButton && !leftAction ? (
              <IconButton 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                aria-label="Go back"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </IconButton>
            ) : (
              leftAction
            )}
          </div>
        )}
        
        {title && (
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-xl font-semibold text-[#333333] truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-[#666666] truncate">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>
      
      {rightAction && (
        <div className="ml-3">
          {rightAction}
        </div>
      )}
    </header>
  )
}

export default Header