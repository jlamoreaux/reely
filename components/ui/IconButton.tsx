'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'primary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isRound?: boolean
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    isRound = true,
    children,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      default: 'bg-[#F5F5DC] text-[#333333] hover:bg-[#E8E5C8] focus:ring-[#7C9885]',
      ghost: 'bg-transparent text-[#666666] hover:bg-gray-100 focus:ring-gray-400',
      primary: 'bg-[#7C9885] text-white hover:bg-[#5F7A67] focus:ring-[#7C9885]',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    }
    
    const sizes = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isRound ? 'rounded-full' : 'rounded-lg',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'

export default IconButton