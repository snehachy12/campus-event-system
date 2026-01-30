'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  LogOut, 
  RefreshCw,
  AlertCircle 
} from 'lucide-react'

interface User {
  _id: string
  name: string
  role: string
  roleRequestStatus: string
  roleRejectionReason?: string
  isApproved: boolean
}

export default function PendingApprovalPage() {
  const router = useRouter()
  const [status, setStatus] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    checkStatus()
    // Check status every 5 seconds
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const checkStatus = async () => {
    setIsChecking(true)
    try {
      const userId = localStorage.getItem('userId')
      const token = localStorage.getItem('authToken')

      if (!userId || !token) {
        router.push('/login')
        return
      }

      const res = await fetch(`/api/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        const userData: User = await res.json()
        setUser(userData)
        setStatus(userData.roleRequestStatus)
        
        if (userData.roleRejectionReason) {
          setRejectionReason(userData.roleRejectionReason)
        }

        // Auto-redirect if approved
        if (userData.roleRequestStatus === 'approved') {
          setTimeout(() => {
            router.push('/organizer/dashboard')
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Error checking status:', error)
    } finally {
      setIsChecking(false)
    }
  }

  // --- REJECTED VIEW ---
  if (status === 'rejected') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Card className="bg-zinc-900 border-red-900/50 p-8 rounded-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Request Declined</h1>
          <p className="text-zinc-400 mb-4">
            The admin team has reviewed and declined your request to become an organizer at this time.
          </p>
          
          {rejectionReason && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
              <p className="text-xs text-red-400 font-semibold mb-1">Reason:</p>
              <p className="text-sm text-red-300">{rejectionReason}</p>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/participant/dashboard">
              <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white">
                Return to Participant Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  // --- APPROVED VIEW (Transition) ---
  if (status === 'approved') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Card className="bg-zinc-900 border-green-500/30 p-8 rounded-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">You're Approved!</h1>
          <p className="text-zinc-400 mb-8">
            Welcome to the team. Redirecting you to your new dashboard...
          </p>
          <div className="flex justify-center">
             <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </Card>
      </div>
    )
  }

  // --- PENDING VIEW (Default) ---
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#e78a53]/5 rounded-full blur-3xl pointer-events-none"></div>

      <Card className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl max-w-md w-full relative z-10 shadow-2xl">
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-yellow-500/20">
          <Clock className="h-8 w-8 text-yellow-500 animate-pulse" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">Approval Pending</h1>
        
        <div className="space-y-4 mb-8">
          <p className="text-zinc-400 leading-relaxed">
            Your request is currently being reviewed by the Campus Admins. You will automatically be redirected once approved.
          </p>
          <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">Status</p>
            <p className="text-yellow-500 font-medium flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></span>
              Awaiting Verification
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            onClick={() => checkStatus()}
            disabled={isChecking}
            className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Check Status Now
          </Button>
          
          <Link href="/participant/dashboard" className="block">
            <Button variant="ghost" className="w-full text-zinc-500 hover:text-zinc-400">
              <LogOut className="h-4 w-4 mr-2" /> Continue as Participant
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
