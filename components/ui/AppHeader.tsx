'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useConvexAuth } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Text, Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface AppHeaderProps {
  className?: string
}

const AppHeader: React.FC<AppHeaderProps> = ({ className }) => {
  const { isAuthenticated } = useConvexAuth()
  const { signOut } = useAuthActions()
  const router = useRouter()
  const currentUser = useQuery(api.users.getCurrentUser)

  return (
    <header className={cn(
      'sticky top-0 z-10 bg-cream-50/80 backdrop-blur-md border-b border-sage-200/30',
      className
    )}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <Text as="h1" size="4xl" weight="normal" color="sage-700" serif>
            Reely
          </Text>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link href="/upload">
            <Button size="sm" variant="secondary" className="rounded-full px-6">
              Upload Video
            </Button>
          </Link>
          
          {currentUser && (
            <Link href={`/profile/${currentUser.username}`}>
              <Text 
                size="sm"
                color="sage-700" 
                className="hover:text-sage-900 transition-colors"
              >
                Profile
              </Text>
            </Link>
          )}
          
          {isAuthenticated && (
            <button
              onClick={() => signOut().then(() => router.push('/signin'))}
            >
              <Text 
                size="sm"
                color="tertiary" 
                className="hover:text-sage-700 transition-colors"
              >
                Sign Out
              </Text>
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default AppHeader