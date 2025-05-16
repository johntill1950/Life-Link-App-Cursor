'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  BarChartIcon, 
  ClockIcon, 
  PersonIcon, 
  GearIcon, 
  InfoCircledIcon 
} from '@radix-ui/react-icons'

interface LayoutProps {
  children: ReactNode
}

const navItems = [
  { href: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { href: '/history', icon: BarChartIcon, label: 'History' },
  { href: '/profile', icon: PersonIcon, label: 'Profile' },
  { href: '/settings', icon: GearIcon, label: 'Settings' },
  { href: '/about', icon: InfoCircledIcon, label: 'About' },
]

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center py-2 px-3 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
      <main className="pb-20">
        {children}
      </main>
    </div>
  )
} 