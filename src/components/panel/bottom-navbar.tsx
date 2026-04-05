'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getMenuList } from '@/lib/menu-list'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function BottomNavbar() {
  const { data: session } = useSession()
  const isLoggedIn = !!session
  const pathname = usePathname()
  const menuList = getMenuList(pathname, isLoggedIn)

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-background border-t border-muted shadow-md">
      <div className="flex justify-around items-center h-16">
        {menuList
          .flatMap(group => group.menus)
          .slice(0, 5)
          .map(({ href, icon: Icon, label }) => {
          const isActive =
            href === '/'
              ? pathname === '/'
              : pathname === href || pathname.startsWith(`${href}/`)

            return (
              <motion.div
                key={href}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link href={href} className="flex flex-col items-center text-xs">
                  <Icon
                    className={cn(
                      'w-6 h-6 transition-colors',
                      isActive ? 'text-indigo-600' : 'text-muted-foreground'
                    )}
                  />
                  <span
                    className={cn(
                      'text-[11px] mt-1 transition-colors',
                      isActive ? 'text-indigo-600 font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </span>
                </Link>
              </motion.div>
            )
          })}
      </div>
    </nav>
  )
}