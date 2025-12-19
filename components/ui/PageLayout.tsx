'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  background?: 'default' | 'cream' | 'sage'
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  maxWidth = '6xl',
  padding = 'md',
  background = 'default'
}) => {
  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full',
  }
  
  const paddings = {
    none: '',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
  }
  
  const backgrounds = {
    default: 'bg-cream-300',
    cream: 'bg-cream-100',
    sage: 'bg-sage-50',
  }
  
  return (
    <div className={cn('min-h-screen', backgrounds[background])}>
      <div className={cn(
        maxWidths[maxWidth],
        paddings[padding],
        'mx-auto',
        className
      )}>
        {children}
      </div>
    </div>
  )
}

export default PageLayout