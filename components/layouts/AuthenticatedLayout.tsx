'use client'

import React, { useEffect } from 'react'
import { useConvexAuth } from 'convex/react'
import { useRouter } from 'next/navigation'
import { PageLayout, AppHeader } from '@/components/ui'
import { cn } from '@/lib/utils'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full'
  showHeader?: boolean
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
  className,
  maxWidth = '7xl',
  showHeader = true,
}) => {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <PageLayout className="flex items-center justify-center min-h-screen">
        <div className="text-sage-600">Loading...</div>
      </PageLayout>
    )
  }

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  }

  return (
    <div className="min-h-screen bg-cream-300">
      {showHeader && <AppHeader />}
      <div className={cn(maxWidths[maxWidth], 'mx-auto px-6 py-6', className)}>
        {children}
      </div>
    </div>
  )
}

export default AuthenticatedLayout