"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  CalendarDays, 
  UtensilsCrossed, 
  BookOpen, 
  Settings, 
  LogOut, 
  Briefcase, 
  Boxes,
  UserCircle
} from "lucide-react"

interface SidebarProps {
    className?: string
}

export function OrganizerSidebar({ className = "" }: SidebarProps) {
    const pathname = usePathname()
    
    // Check if the current path starts with the link href
    const isActive = (path: string) => pathname.startsWith(path)

    const navItems = [
        { 
            href: "/organizer/dashboard", 
            icon: LayoutDashboard, 
            label: "Dashboard",
            exact: true 
        },
        { 
            href: "/organizer/events", 
            icon: CalendarDays, 
            label: "Events" 
        },
        { 
            href: "/organizer/resources", 
            icon: Boxes, 
            label: "Resources" 
        },
        { 
            href: "/organizer/participants", 
            icon: UserCircle, 
            label: "Participants" 
        },
        { 
            href: "/organizer/internships", 
            icon: Briefcase, 
            label: "Oppturnites" 
        },
    ]

    return (
        <aside className={`w-64 bg-zinc-900/50 backdrop-blur-sm border-r border-zinc-800 flex flex-col ${className}`}>
            <div className="p-6">
                <Link href="/organizer/dashboard" className="text-[#e78a53] font-bold text-xl">
                    Festo
                </Link>
                <p className="text-zinc-400 text-sm mt-1">Organizer Portal</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    // Handle exact matching for dashboard vs prefix matching for sections
                    const active = item.exact 
                        ? pathname === item.href 
                        : isActive(item.href)

                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                active
                                ? 'text-white bg-[#e78a53]/10 border-l-2 border-[#e78a53]'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                            }`}>
                                <Icon className={`h-5 w-5 ${active ? 'text-[#e78a53]' : ''}`} />
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
        </aside>
    )
}