'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  showCount?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    className,
    label,
    error,
    helperText,
    showCount = false,
    resize = 'vertical',
    maxLength,
    required,
    value,
    ...props 
  }, ref) => {
    const id = props.id || props.name
    const characterCount = value ? String(value).length : 0
    
    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    }
    
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
        
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full px-3 py-2 border rounded-lg bg-white text-[#333333] placeholder-[#999999]',
            'focus:outline-none focus:ring-2 focus:ring-[#7C9885] focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            'transition-all duration-200',
            resizeClasses[resize],
            error && 'border-red-500 focus:ring-red-500',
            !error && 'border-[#E0E0E0]'
          )}
          value={value}
          maxLength={maxLength}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        
        <div className="mt-1 flex justify-between">
          <div>
            {error && (
              <p id={`${id}-error`} className="text-sm text-red-500">
                {error}
              </p>
            )}
            
            {helperText && !error && (
              <p id={`${id}-helper`} className="text-sm text-[#666666]">
                {helperText}
              </p>
            )}
          </div>
          
          {showCount && maxLength && (
            <span className="text-sm text-[#666666]">
              {characterCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'

export default TextArea