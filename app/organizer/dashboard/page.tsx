"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrganizerSidebar } from "@/components/organizer-sidebar"
import { UserMenu } from "@/components/user-menu"
import {
  Calendar, Ticket, IndianRupee, Plus, Users, 
  TrendingUp, Bell, ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';

/* -------------------- TYPES -------------------- */

interface DashboardData {
  stats: {
    totalEvents: number
    totalTicketsSold: number
    totalRevenue: number
    activeEvents: number
  }
  charts: {
    revenueTrend: { date: string; revenue: number }[]
    eventPerformance: { name: string; ticketSales: number; revenue: number }[]
  }
}

export default function OrganizerDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [organizerName, setOrganizerName] = useState("")

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const user = JSON.parse(userStr)
      setOrganizerName(user.organizationName || user.name)
      fetchDashboardData(user._id || user.id)
    }
  }, [])

  const fetchDashboardData = async (userId: string) => {
    try {
      const res = await fetch(`/api/organizer/dashboard?userId=${userId}`)
      const json = await res.json()
      if (json.success) {
        setData(json)
      }
    } catch (error) {
      console.error("Failed to load dashboard", error)
    } finally {
      setLoading(false)
    }
  }

  // Fallback data for skeleton/loading state
  const defaultStats = { totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0, activeEvents: 0 }

  return (
    <div className="min-h-screen bg-black flex">
      <OrganizerSidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/30 backdrop-blur px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Analytics Overview</h1>
            <p className="text-zinc-400 text-sm">
              Welcome back, <span className="text-[#e78a53] font-medium">{organizerName}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/organizer/create-event">
              <Button className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white shadow-[0_0_15px_rgba(231,138,83,0.3)]">
                <Plus className="h-4 w-4 mr-2" /> Create Event
              </Button>
            </Link>
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5 text-zinc-400" /></Button>
            <UserMenu />
          </div>
        </header>

        <div className="p-8 space-y-8">
          
          {/* 1. KEY METRICS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              icon={<IndianRupee className="h-5 w-5 text-green-400" />}
              label="Total Revenue"
              value={`₹${(data?.stats.totalRevenue || 0).toLocaleString()}`}
              trend="+12.5%"
              trendUp={true}
              bgClass="bg-green-500/10"
              borderColor="border-green-500/20"
            />
            <MetricCard 
              icon={<Ticket className="h-5 w-5 text-blue-400" />}
              label="Tickets Sold"
              value={(data?.stats.totalTicketsSold || 0).toLocaleString()}
              trend="+5.2%"
              trendUp={true}
              bgClass="bg-blue-500/10"
              borderColor="border-blue-500/20"
            />
            <MetricCard 
              icon={<Activity className="h-5 w-5 text-purple-400" />}
              label="Active Events"
              value={data?.stats.activeEvents || 0}
              trend="2 Ending Soon"
              trendUp={false} // Neutral
              bgClass="bg-purple-500/10"
              borderColor="border-purple-500/20"
            />
            <MetricCard 
              icon={<Users className="h-5 w-5 text-[#e78a53]" />}
              label="Total Events Hosted"
              value={data?.stats.totalEvents || 0}
              trend="Lifetime"
              trendUp={true}
              bgClass="bg-[#e78a53]/10"
              borderColor="border-[#e78a53]/20"
            />
          </div>

          {/* 2. CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            
            {/* Main Chart: Revenue Trend */}
            <Card className="col-span-4 bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Revenue Trends</CardTitle>
                <CardDescription className="text-zinc-400">Daily revenue over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="pl-0">
                <div className="h-[300px] w-full">
                  {loading || !data ? (
                    <div className="h-full w-full flex items-center justify-center text-zinc-600">Loading chart...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.charts.revenueTrend}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#e78a53" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#e78a53" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#71717a" 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        />
                        <YAxis 
                          stroke="#71717a" 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#e78a53" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Secondary Chart: Top Performing Events */}
            <Card className="col-span-3 bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Top Events</CardTitle>
                <CardDescription className="text-zinc-400">Highest revenue generating events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {loading || !data ? (
                     <div className="h-full w-full flex items-center justify-center text-zinc-600">Loading chart...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.charts.eventPerformance} layout="vertical" margin={{ left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={100} 
                          tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          cursor={{ fill: '#27272a', opacity: 0.4 }}
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. QUICK ACTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickActionCard 
              icon={<Plus className="h-6 w-6 text-[#e78a53]" />}
              title="Host New Event"
              desc="Create a workshop, hackathon, or cultural activity."
              href="/organizer/create-event"
            />
            <QuickActionCard 
              icon={<TrendingUp className="h-6 w-6 text-green-400" />}
              title="Detailed Report"
              desc="Download full CSV reports of your sales data."
              href="/organizer/reports"
            />
             <QuickActionCard 
              icon={<Users className="h-6 w-6 text-blue-400" />}
              title="Manage Attendees"
              desc="Check-in users and manage guest lists."
              href="/organizer/attendees"
            />
          </div>

        </div>
      </main>
    </div>
  )
}

/* --- Sub Components --- */

function MetricCard({ icon, label, value, trend, trendUp, bgClass, borderColor }: any) {
  return (
    <Card className={`bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-all group`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl border ${borderColor} ${bgClass} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trendUp ? 'text-green-400 bg-green-400/10' : 'text-zinc-400 bg-zinc-400/10'
          }`}>
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionCard({ icon, title, desc, href }: any) {
  return (
    <Link href={href}>
      <Card className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/80 hover:border-[#e78a53]/30 transition-all cursor-pointer h-full group">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 group-hover:border-[#e78a53]/50 transition-colors">
            {icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-[#e78a53] transition-colors">{title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}