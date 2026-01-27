"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type User = { name: string; role: string; avatarInitials?: string }

export function UserMenu() {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        try {
            const raw = localStorage.getItem('currentUser')
            if (raw) {
                const parsed = JSON.parse(raw)
                setUser({ name: parsed.name || 'User', role: parsed.role || 'student', avatarInitials: parsed.avatarInitials || '' })
            }
        } catch { }
    }, [])

    const logout = () => {
        localStorage.removeItem('currentUser')
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('userRole')
        window.location.href = '/'
    }

    const initials = user?.avatarInitials || (user?.name || 'U').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-zinc-300">{user?.name || 'Guest'}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                <DropdownMenuLabel>{user?.name || 'Guest'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-zinc-300">
                  Role: {user?.role === 'canteen' ? 'Canteen Manager' : (user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || '-')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-400">Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

