"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { AdminSidebar } from "@/components/admin-sidebar"
import {
    ShieldBan, CheckCircle, Trash2,
    Search, Loader2, MoreVerticalIcon, UserCog
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

interface User {
    _id: string
    name: string
    email: string
    role: string
    accountStatus: 'pending' | 'active' | 'blocked'
    createdAt: string
}

export default function AdminUserManagement() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [filterRole, setFilterRole] = useState('all')
    const [search, setSearch] = useState('')
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [filterRole])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/manage?role=${filterRole}`)
            const data = await res.json()
            if (data.success) setUsers(data.users)
        } catch (error) {
            console.error("Failed to fetch users")
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (userId: string, action: string) => {
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;

        setProcessingId(userId)
        try {
            const res = await fetch('/api/admin/manage', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action })
            })

            if (res.ok) {
                fetchUsers()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setProcessingId(null)
        }
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
            case 'blocked': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Blocked</Badge>
            case 'pending': return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>
            default: return <Badge variant="outline">Unknown</Badge>
        }
    }

    return (
        <div className="min-h-screen bg-black flex">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                        <p className="text-zinc-400">Approve, block, or remove users.</p>
                    </div>
                </div>

                {/* Filters */}
                <Card className="bg-zinc-900 border-zinc-800 mb-6">
                    <CardContent className="p-4 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search by name or email..."
                                className="bg-zinc-950 border-zinc-700 pl-10 text-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* 👇 FIXED SECTION: Wrapped SelectContent inside Select and added Trigger */}
                        <Select value={filterRole} onValueChange={setFilterRole}>
                            <SelectTrigger className="w-[200px] bg-zinc-950 border-zinc-700 text-white">
                                <SelectValue placeholder="Filter by Role" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="student">Students</SelectItem>
                                <SelectItem value="teacher">Teachers</SelectItem>
                                <SelectItem value="organizer">Organizers</SelectItem>
                                <SelectItem value="canteen_manager">Canteen Managers</SelectItem>
                            </SelectContent>
                        </Select>
                        {/* 👆 END FIXED SECTION */}

                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-[#e78a53]" /></div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-12 text-center text-zinc-500">No users found.</div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                                    <tr>
                                        <th className="p-4 font-medium">User</th>
                                        <th className="p-4 font-medium">Role</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Joined</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-zinc-800/30 transition">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">{user.name}</div>
                                                        <div className="text-zinc-500 text-xs">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className="capitalize border-zinc-700 text-zinc-300">
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(user.accountStatus)}
                                            </td>
                                            <td className="p-4 text-zinc-500">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" disabled={processingId === user._id}>
                                                            {processingId === user._id ? <Loader2 className="animate-spin h-4 w-4" /> : <MoreVerticalIcon className="h-4 w-4" />}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                                        {user.accountStatus === 'pending' && (
                                                            <DropdownMenuItem className="text-green-400 focus:text-green-300 cursor-pointer" onClick={() => handleAction(user._id, 'approve')}>
                                                                <CheckCircle className="h-4 w-4 mr-2" /> Approve Registration
                                                            </DropdownMenuItem>
                                                        )}
                                                        {user.accountStatus === 'blocked' ? (
                                                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleAction(user._id, 'unblock')}>
                                                                <UserCog className="h-4 w-4 mr-2" /> Unblock User
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem className="text-orange-400 focus:text-orange-300 cursor-pointer" onClick={() => handleAction(user._id, 'block')}>
                                                                <ShieldBan className="h-4 w-4 mr-2" /> Block User
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem className="text-red-500 focus:text-red-400 cursor-pointer" onClick={() => handleAction(user._id, 'delete')}>
                                                            <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}