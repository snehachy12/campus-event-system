"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  MapPin,
  UtensilsCrossed,
  BookOpen,
  Users,
  Briefcase,
  UserCheck,
  Settings,
  LogOut,
  LayoutDashboard,
  QrCode,
  ScanQrCode,
  BellIcon,
  Clock,
  Brain
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export function ParticipantSidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: "/participant/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/participant/events", icon: Users, label: "Browse Events" },
    { href: "/participant/schedule", icon: Clock, label: "My Schedule" },

    { href: "/participant/ticket", icon: ScanQrCode, label: "My Pass", priority: true },

    { href: "/participant/workshop", icon: BookOpen, label: "Workshops" },
    { href: "/participant/campus-mentor", icon: Brain, label: "Campus Mentor" },
    { href: "/participant/announcement", icon: BellIcon, label: "Announcements" },

    { href: "/participant/internship", icon: Briefcase, label: "Post-Event Opportunities" },
  ]

  return (
    <aside className={`w-64 bg-zinc-900/50 backdrop-blur-sm border-r border-zinc-800 flex flex-col ${className}`}>
      <div className="p-6">
        <Link href="/participant/dashboard" className="text-[#e78a53] font-bold text-xl">
          Festo
        </Link>
        <p className="text-zinc-400 text-sm mt-1">Participant Portal</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
                    ? "text-white bg-[#e78a53]/10 border-l-2 border-[#e78a53]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
              >
                <Icon
                  className={`h-5 w-5 ${active || item.priority ? "text-[#e78a53]" : ""
                    }`}
                />

                <span>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>




      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5 text-zinc-400" />
          </Button>
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5 text-zinc-400" />
          </Button>
        </div>
      </div>
    </aside >
  )
}