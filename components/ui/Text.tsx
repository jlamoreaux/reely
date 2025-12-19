'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface TextProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'sage-400' | 'sage-500' | 'sage-600' | 'sage-700'
  serif?: boolean
  children: React.ReactNode
  className?: string
  htmlFor?: string
}

const Text: React.FC<TextProps> = ({
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  color = 'primary',
  serif,
  children,
  className,
  ...props
}) => {
  // Use serif for h1-h3 by default unless explicitly set to false
  const shouldUseSerif = serif !== undefined ? serif : ['h1', 'h2', 'h3'].includes(Component)
  
  const sizes = {
    xs: 'text-xs leading-relaxed',
    sm: 'text-sm leading-relaxed', 
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-relaxed',
    xl: 'text-xl leading-relaxed',
    '2xl': 'text-2xl leading-tight',
    '3xl': 'text-3xl leading-tight',
    '4xl': 'text-4xl leading-tight',
    '5xl': 'text-5xl leading-tight',
  }
  
  const weights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold', 
    bold: 'font-bold',
  }
  
  const colors = {
    primary: 'text-foreground',
    secondary: 'text-sage-700',
    tertiary: 'text-sage-600',
    inverse: 'text-white',
    'sage-400': 'text-sage-400',
    'sage-500': 'text-sage-500',
    'sage-600': 'text-sage-600',
    'sage-700': 'text-sage-700',
  }
  
  return (
    <Component 
      className={cn(
        sizes[size],
        weights[weight],
        colors[color],
        shouldUseSerif && 'font-serif',
        !shouldUseSerif && 'tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export default Text