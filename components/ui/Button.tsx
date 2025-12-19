'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  as?: React.ElementType
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    as: Component = 'button',
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-sage-600 text-white hover:bg-sage-700 active:bg-sage-800 focus:ring-sage-400 border-0 dark:bg-sage-500 dark:hover:bg-sage-600 dark:active:bg-sage-700',
      secondary: 'bg-transparent text-sage-700 border border-sage-300 hover:bg-sage-50 active:bg-sage-100 focus:ring-sage-400 dark:text-sage-300 dark:border-sage-600 dark:hover:bg-sage-900 dark:active:bg-sage-800',
      ghost: 'bg-transparent text-sage-700 hover:bg-sage-50 active:bg-sage-100 focus:ring-sage-400 border-0 dark:text-sage-300 dark:hover:bg-sage-900 dark:active:bg-sage-800',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-400 border-0 dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700',
    }
    
    const sizes = {
      xs: 'px-3 py-1.5 text-xs rounded-full',
      sm: 'px-4 py-2 text-sm rounded-full',
      md: 'px-6 py-2.5 text-base rounded-full',
      lg: 'px-8 py-3 text-lg rounded-full',
    }
    
    return (
      <Component
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </Component>
    )
  }
)

Button.displayName = 'Button'

export default Button