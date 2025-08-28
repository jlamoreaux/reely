'use client'

import React from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className,
    label,
    error,
    helperText,
    options,
    placeholder = 'Select an option',
    required,
    disabled,
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
          <select
            ref={ref}
            id={id}
            className={cn(
              'w-full px-3 py-2 pr-10 border rounded-lg bg-white text-[#333333] appearance-none',
              'focus:outline-none focus:ring-2 focus:ring-[#7C9885] focus:border-transparent',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              'transition-all duration-200',
              error && 'border-red-500 focus:ring-red-500',
              !error && 'border-[#E0E0E0]',
              !props.value && 'text-[#999999]'
            )}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value} 
                disabled={option.disabled}
                className="text-[#333333]"
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666] pointer-events-none" />
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

Select.displayName = 'Select'

export default Select