'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OrganizerSidebar } from '@/components/organizer-sidebar'
import { UserMenu } from '@/components/user-menu'
import { 
  Zap, 
  Calendar, 
  Users, 
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  BarChart3
} from 'lucide-react'

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

export default function OrganizerDashboardPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const persona = localStorage.getItem("selectedPersona")
    const userStr = localStorage.getItem("currentUser")
    let isApproved = false
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        isApproved = user.role === "organizer" && (user.roleRequestStatus === "approved" || user.isApproved)
      } catch {}
    }
    setAllowed(persona === "organizer" && isApproved)
    setChecked(true)
  }, [])

  const handleSwitchToParticipant = () => {
    localStorage.setItem("selectedPersona", "participant")
    router.push("/participant/dashboard")
  }

  if (!checked) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Checking permissions...</div>
  }

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p>You must be an approved organizer and have selected the Organizer persona to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      <OrganizerSidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Organizer Dashboard</h1>
              <p className="text-zinc-400">Manage your events and bookings</p>
            </div>
            <UserMenu />
          </div>
        </header>

        <div className="p-8">
          {/* Persona Switch Button */}
          <div className="mb-8 flex justify-end">
            <Button 
              onClick={handleSwitchToParticipant}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Switch to Participant
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              icon={<Calendar className="h-6 w-6 text-blue-400" />}
              label="Events Created"
              value="12"
              trend="+3"
              trendUp={true}
              bgClass="bg-blue-500/10"
              borderColor="border-blue-500/30"
            />
            <MetricCard
              icon={<Users className="h-6 w-6 text-purple-400" />}
              label="Total Attendees"
              value="245"
              trend="+8%"
              trendUp={true}
              bgClass="bg-purple-500/10"
              borderColor="border-purple-500/30"
            />
            <MetricCard
              icon={<IndianRupee className="h-6 w-6 text-green-400" />}
              label="Revenue"
              value="₹45,000"
              trend="+12%"
              trendUp={true}
              bgClass="bg-green-500/10"
              borderColor="border-green-500/30"
            />
            <MetricCard
              icon={<Zap className="h-6 w-6 text-[#e78a53]" />}
              label="Bookings"
              value="8"
              trend="+2"
              trendUp={true}
              bgClass="bg-[#e78a53]/10"
              borderColor="border-[#e78a53]/30"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickActionCard
              icon={<Calendar className="h-6 w-6 text-blue-400" />}
              title="Create Event"
              desc="Plan and organize a new event for your community"
              href="/organizer/create-event"
            />
            <QuickActionCard
              icon={<Users className="h-6 w-6 text-purple-400" />}
              title="My Events"
              desc="View and manage all your organized events"
              href="/organizer/my-events"
            />
            <QuickActionCard
              icon={<IndianRupee className="h-6 w-6 text-green-400" />}
              title="Booking Requests"
              desc="Manage venue booking requests and payments"
              href="/organizer/booking-requests"
            />
            <QuickActionCard
              icon={<BarChart3 className="h-6 w-6 text-[#e78a53]" />}
              title="Analytics"
              desc="View event analytics and performance metrics"
              href="/organizer/analysis"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
