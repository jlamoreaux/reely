'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  inputClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    inputClassName,
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    type = 'text',
    disabled,
    required,
    ...props 
  }, ref) => {
    const id = props.id || props.name
    
    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label 
            htmlFor={id} 
            className="block text-sm font-medium text-[#333333] mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={id}
            type={type}
            className={cn(
              'w-full px-3 py-2 border rounded-lg bg-white text-[#333333] placeholder-[#999999]',
              'focus:outline-none focus:ring-2 focus:ring-[#7C9885] focus:border-transparent',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              'transition-all duration-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 focus:ring-red-500',
              !error && 'border-[#E0E0E0]',
              inputClassName
            )}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666]">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p id={`${id}-error`} className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${id}-helper`} className="mt-1 text-sm text-[#666666]">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input