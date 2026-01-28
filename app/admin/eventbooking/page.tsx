"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminSidebar } from "@/components/admin-sidebar" 
import { UserMenu } from "@/components/user-menu"
import {
  Bell,
  CalendarDays,
  Users,
  Briefcase,
  TrendingUp,
  IndianRupee,
  Receipt,
  ShoppingBag,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { useEffect, useState } from "react"

// Updated Interfaces to include User Details for Admin visibility
interface EventBooking {
  _id: string
  bookingId: string
  eventTitle: string
  participantName?: string // Added for Admin
  participantEmail?: string // Added for Admin
  totalAmount: number
  paymentStatus: string
  bookingStatus: string
  createdAt: string
}

interface FoodOrder {
  _id: string
  orderId: string
  customerName?: string // Added for Admin
  canteenName: string
  totalAmount: number
  paymentStatus: string
  status: string
  createdAt: string
  items: any[]
}

interface DashboardStats {
  totalUsers: number
  totalRevenue: number
  activeEvents: number
  pendingInternships: number
}

export default function AdminDashboard() {
  const [recentBookings, setRecentBookings] = useState<EventBooking[]>([])
  const [recentOrders, setRecentOrders] = useState<FoodOrder[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRevenue: 0,
    activeEvents: 0,
    pendingInternships: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // 1. Fetch System Stats (You might need to create a dedicated stats endpoint)
      // const statsRes = await fetch('/api/admin/stats')
      
      // 2. Fetch ALL Recent Bookings (Removed participantId filter)
      const bookingsRes = await fetch('/api/event-bookings?limit=5&sort=desc')
      
      // 3. Fetch ALL Recent Orders
      const ordersRes = await fetch('/api/orders?limit=5&sort=desc')

      if (bookingsRes.ok && ordersRes.ok) {
        const bookingsData = await bookingsRes.json()
        const ordersData = await ordersRes.json()
        
        setRecentBookings(bookingsData.bookings || [])
        setRecentOrders(ordersData.data || [])

        // Calculate simplified stats from the fetched data (or use a dedicated API)
        // In a real app, these should come from /api/admin/stats
        const bookingRevenue = (bookingsData.bookings || []).reduce((acc: number, item: any) => acc + item.totalAmount, 0)
        const orderRevenue = (ordersData.data || []).reduce((acc: number, item: any) => acc + item.totalAmount, 0)

        setStats({
          totalUsers: 150, // Mock or fetch from /api/users/count
          totalRevenue: bookingRevenue + orderRevenue,
          activeEvents: 12, // Mock or fetch
          pendingInternships: 5 // Mock or fetch
        })
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-zinc-400">System overview, financial metrics, and user activity</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5 text-zinc-400" />
                </Button>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          
          {/* Admin Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : stats.totalUsers}</p>
                    <p className="text-zinc-400 text-sm">Total Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {loading ? '--' : `₹${stats.totalRevenue.toLocaleString()}`}
                    </p>
                    <p className="text-zinc-400 text-sm">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                    <CalendarDays className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : stats.activeEvents}</p>
                    <p className="text-zinc-400 text-sm">Active Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : stats.pendingInternships}</p>
                    <p className="text-zinc-400 text-sm">Pending Approvals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Recent Global Event Bookings */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-[#e78a53]" />
                  Recent Transactions
                </CardTitle>
                <Link href="/admin/bookings">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-zinc-500">Loading data...</div>
                ) : recentBookings.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">No recent bookings</div>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking._id} className="p-4 bg-zinc-800/30 rounded-lg flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-semibold text-sm">{booking.eventTitle}</h4>
                          {/* Admin sees who booked it */}
                          <p className="text-zinc-400 text-xs mt-1">
                            By: {booking.participantName || "Student"} 
                          </p>
                          <p className="text-zinc-500 text-xs">{new Date(booking.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[#e78a53] font-bold block">₹{booking.totalAmount}</span>
                          <Badge className={`text-[10px] mt-1 ${
                            booking.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {booking.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Food Orders Feed */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-green-400" />
                  Live Order Feed
                </CardTitle>
                <Link href="/admin/orders">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">Monitor</Button>
                </Link>
              </CardHeader>
              <CardContent>
                 {loading ? (
                  <div className="text-center py-8 text-zinc-500">Loading data...</div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">No active orders</div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order._id} className="p-4 bg-zinc-800/30 rounded-lg border-l-2 border-l-transparent hover:border-l-[#e78a53] transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-xs text-zinc-500 block mb-1">Order #{order.orderId}</span>
                            <h4 className="text-white font-semibold text-sm">{order.canteenName}</h4>
                          </div>
                          <Badge variant="outline" className={`text-xs ${
                            order.status === 'completed' ? 'border-green-500/30 text-green-400' :
                            order.status === 'preparing' ? 'border-yellow-500/30 text-yellow-400' :
                            'border-zinc-500/30 text-zinc-400'
                          }`}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-xs text-zinc-400">
                          <span>{order.items.length} Items</span>
                          <span className="text-white">₹{order.totalAmount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  )
}