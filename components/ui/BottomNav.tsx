'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  MagnifyingGlassIcon,
  VideoCameraIcon,
  UserIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  VideoCameraIcon as VideoCameraIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'

export interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  activeIcon: React.ReactNode
  isCenter?: boolean
}

const defaultNavItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: <HomeIcon className="w-6 h-6" />,
    activeIcon: <HomeIconSolid className="w-6 h-6" />
  },
  {
    label: 'Discover',
    href: '/discover',
    icon: <MagnifyingGlassIcon className="w-6 h-6" />,
    activeIcon: <MagnifyingGlassIconSolid className="w-6 h-6" />
  },
  {
    label: 'Record',
    href: '/record',
    icon: <PlusCircleIcon className="w-9 h-9" />,
    activeIcon: <PlusCircleIcon className="w-9 h-9" />,
    isCenter: true
  },
  {
    label: 'Activity',
    href: '/activity',
    icon: <VideoCameraIcon className="w-6 h-6" />,
    activeIcon: <VideoCameraIconSolid className="w-6 h-6" />
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: <UserIcon className="w-6 h-6" />,
    activeIcon: <UserIconSolid className="w-6 h-6" />
  },
]

export interface BottomNavProps {
  navItems?: NavItem[]
  className?: string
  hideOnPaths?: string[]
}

const BottomNav: React.FC<BottomNavProps> = ({
  navItems = defaultNavItems,
  className,
  hideOnPaths = []
}) => {
  const pathname = usePathname()
  
  if (hideOnPaths.includes(pathname)) {
    return null
  }
  
  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E0E0E0] md:hidden',
      className
    )}>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href !== '/' && pathname.startsWith(item.href))
          
          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="bg-[#7C9885] text-white rounded-full p-3 shadow-lg">
                  {item.icon}
                </div>
              </Link>
            )
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-2 transition-colors',
                isActive ? 'text-[#7C9885]' : 'text-[#999999]'
              )}
            >
              {isActive ? item.activeIcon : item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav