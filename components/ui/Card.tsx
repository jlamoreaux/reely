'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className,
  variant = 'default',
  padding = 'md',
  rounded = '2xl'
}) => {
  const baseStyles = 'bg-white/60 dark:bg-sage-900/60 backdrop-blur-sm'
  
  const variants = {
    default: 'shadow-subtle',
    elevated: 'shadow-soft',
    outlined: 'border border-sage-200/50 shadow-none',
  }
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  
  const roundings = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    '2xl': 'rounded-3xl',
  }
  
  return (
    <div 
      className={cn(
        baseStyles,
        variants[variant],
        paddings[padding],
        roundings[rounded],
        'transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  )
}

export default Card