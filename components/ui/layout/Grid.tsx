'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface GridProps {
  children: React.ReactNode
  cols?: number | { sm?: number; md?: number; lg?: number; xl?: number }
  gap?: number | string
  className?: string
  as?: React.ElementType
}

const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  gap = 4,
  className,
  as: Component = 'div',
}) => {
  const getColClasses = () => {
    if (typeof cols === 'number') {
      return `grid-cols-${cols}`
    }
    
    const classes: string[] = []
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`)
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`)
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`)
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`)
    
    return classes.join(' ')
  }
  
  const gapClass = typeof gap === 'number' ? `gap-${gap}` : gap
  
  return (
    <Component
      className={cn(
        'grid',
        getColClasses(),
        gapClass,
        className
      )}
    >
      {children}
    </Component>
  )
}

export default Grid