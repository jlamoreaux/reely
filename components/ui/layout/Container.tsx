'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface ContainerProps {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
  as?: React.ElementType
}

const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'lg',
  className,
  as: Component = 'div',
}) => {
  const maxWidths = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  }
  
  return (
    <Component
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8 w-full',
        maxWidths[maxWidth],
        className
      )}
    >
      {children}
    </Component>
  )
}

export default Container