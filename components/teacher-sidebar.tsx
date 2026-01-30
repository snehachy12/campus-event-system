"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, UtensilsCrossed, UserCheck, Settings, LogOut, Users, BookOpen, ClipboardList, Building2, CheckSquare, Code, Music, Trophy } from "lucide-react"

interface SidebarProps {
    className?: string
}

export function TeacherSidebar({ className = "" }: SidebarProps) {
    const pathname = usePathname()
    const [persona, setPersona] = useState<string>("teacher")

    useEffect(() => {
        const storedPersona = localStorage.getItem("selectedPersona") || "teacher";
        setPersona(storedPersona);
        const handleStorageChange = () => {
            const newPersona = localStorage.getItem("selectedPersona") || "teacher";
            setPersona(newPersona);
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [])

    const isActive = (path: string) => pathname === path

    const teacherItems = [
        { href: "/teacher/analysis", icon: Users, label: "Analysis" },
        { href: "/teacher/classroom", icon: UserCheck, label: "Classroom" },
        { href: "/teacher/events", icon: Users, label: "Events" },
        { href: "/teacher/venues", icon: Building2, label: "Browse Venues" },
        { href: "/teacher/booking-requests", icon: CheckSquare, label: "My Bookings" },
        { href: "/teacher/food", icon: UtensilsCrossed, label: "Food" },
        { href: "/teacher/classroom/attendance", icon: UserCheck, label: "Attendance" },
        { href: "/teacher/classroom/materials", icon: BookOpen, label: "Materials" },
        { href: "/teacher/classroom/schedule", icon: ClipboardList, label: "Schedule" },
    ]

    const participantItems = [
        { href: "/teacher/workshops", icon: Code, label: "Workshops" },
        { href: "/teacher/tech-fest", icon: Code, label: "Tech Fest" },
        { href: "/teacher/cultural-fest", icon: Music, label: "Cultural Fest" },
        { href: "/teacher/sports", icon: Trophy, label: "Sports" },
    ]

    const navItems = persona === "participant" ? participantItems : teacherItems


    return (
        <aside className={`w-64 bg-zinc-900/50 backdrop-blur-sm border-r border-zinc-800 flex flex-col ${className}`}>
            <div className="p-6">
                <Link href="/teacher/dashboard" className="text-[#e78a53] font-bold text-xl">
                    ACE Campus
                </Link>
                <p className="text-zinc-400 text-sm mt-1">{persona === "participant" ? "Participant Portal" : "Teacher Portal"}</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon as any
                    const active = isActive(item.href)
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
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


