'use client'

import React from 'react'
import { CheckIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className,
    label,
    error,
    helperText,
    disabled,
    required,
    checked,
    ...props 
  }, ref) => {
    const id = props.id || props.name
    
    return (
      <div className={cn('flex flex-col', className)}>
        <label 
          htmlFor={id} 
          className={cn(
            'inline-flex items-start cursor-pointer',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <div className="relative flex items-center">
            <input
              ref={ref}
              id={id}
              type="checkbox"
              className="sr-only peer"
              disabled={disabled}
              required={required}
              checked={checked}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
              {...props}
            />
            <div className={cn(
              'w-5 h-5 border-2 rounded flex items-center justify-center transition-all',
              'peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-[#7C9885]',
              'peer-checked:bg-[#7C9885] peer-checked:border-[#7C9885]',
              !checked && 'border-[#CCCCCC] bg-white',
              error && 'border-red-500'
            )}>
              {checked && (
                <CheckIcon className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
          
          {label && (
            <span className="ml-2 text-[#333333] select-none">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
          )}
        </label>
        
        {error && (
          <p id={`${id}-error`} className="mt-1 text-sm text-red-500 ml-7">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${id}-helper`} className="mt-1 text-sm text-[#666666] ml-7">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox