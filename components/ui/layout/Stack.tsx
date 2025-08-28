'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface StackProps {
  children: React.ReactNode
  direction?: 'vertical' | 'horizontal'
  spacing?: number | string
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  className?: string
  as?: React.ElementType
}

const Stack: React.FC<StackProps> = ({
  children,
  direction = 'vertical',
  spacing = 4,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
  as: Component = 'div',
}) => {
  const directionClasses = {
    vertical: 'flex-col',
    horizontal: 'flex-row',
  }
  
  const alignClasses = {
    start: direction === 'vertical' ? 'items-start' : 'items-start',
    center: 'items-center',
    end: direction === 'vertical' ? 'items-end' : 'items-end',
    stretch: 'items-stretch',
  }
  
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }
  
  const spacingClass = typeof spacing === 'number' 
    ? direction === 'vertical' ? `space-y-${spacing}` : `space-x-${spacing}`
    : spacing
  
  return (
    <Component
      className={cn(
        'flex',
        directionClasses[direction],
        alignClasses[align],
        justifyClasses[justify],
        spacingClass,
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </Component>
  )
}

export default Stack