"use client"

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Briefcase,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurrentAdminInfo } from '@/lib/auth-middleware'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Events',
    href: '/admin/events',
    icon: Calendar
  },
  {
    title: 'Resources',
    href: '/admin/resources',
    icon: BookOpen
  },
  {
    title: 'Internships',
    href: '/admin/internships',
    icon: Briefcase
  }
]

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const adminInfo = getCurrentAdminInfo()

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userRole')
    localStorage.removeItem('currentUser')
    router.push('/')
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden bg-zinc-900/80 text-white hover:bg-zinc-800"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
          fixed left-0 top-0 z-50 h-full w-64
          bg-gradient-to-b from-zinc-900/95 to-zinc-950/95
          backdrop-blur-sm border-r border-zinc-800
          transition-all duration-300 ease-in-out
          lg:relative lg:z-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#e78a53]/10 rounded-lg">
                <Shield className="h-6 w-6 text-[#e78a53]" />
              </div>
              <div>
                <h1 className="text-white font-semibold">Admin Panel</h1>
                <p className="text-zinc-400 text-sm">{adminInfo?.username}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="hidden lg:flex text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <li key={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`
                      w-full justify-start gap-3 h-11
                      ${isActive 
                        ? 'bg-[#e78a53] text-white hover:bg-[#e78a53]/90' 
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                      }
                      ${isCollapsed ? 'px-3' : 'px-4'}
                    `}
                    onClick={() => {
                      router.push(item.href)
                      setIsMobileOpen(false)
                    }}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                  </Button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`
              w-full justify-start gap-3 h-11 text-red-400 hover:text-red-300 hover:bg-red-500/10
              ${isCollapsed ? 'px-3' : 'px-4'}
            `}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  )
}
