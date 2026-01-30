"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminSidebar } from "@/components/admin-sidebar"
import { UserMenu } from "@/components/user-menu"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Building, 
  Loader2, 
  AlertCircle 
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RequestUser {
  _id: string
  name: string
  email: string
  organizationName?: string
  roleRequestStatus: string
  requestedRole: string
  createdAt: string
}

export default function AdminRoleRequestsPage() {
  const [requests, setRequests] = useState<RequestUser[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Fetch Data
  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/role-requests')
      const data = await res.json()
      if (data.success) {
        setRequests(data.requests)
      }
    } catch (err) {
      setError("Failed to load requests")
    } finally {
      setLoading(false)
    }
  }

  // Handle Action (Approve/Reject)
  const handleDecision = async (userId: string, action: 'approve' | 'reject', reason?: string) => {
    setProcessingId(userId)
    try {
      const res = await fetch('/api/admin/role-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          action,
          ...(action === 'reject' && reason && { rejectionReason: reason })
        })
      })

      if (res.ok) {
        // Remove the processed user from the list locally (Optimistic update)
        setRequests(prev => prev.filter(req => req._id !== userId))
        setRejectingId(null)
        setRejectionReason('')
      } else {
        setError("Failed to process request")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Role Requests</h1>
              <p className="text-zinc-400">Review and manage organizer access requests</p>
            </div>
            <UserMenu />
          </div>
        </header>

        <div className="p-8">
          {error && (
            <Alert className="mb-6 bg-red-500/10 border-red-500/30 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 text-[#e78a53] animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-zinc-800">
              <CheckCircle className="h-16 w-16 text-green-500/50 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">All Caught Up!</h2>
              <p className="text-zinc-500 mt-2">There are no pending role requests at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {requests.map((req) => (
                <Card key={req._id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{req.name}</CardTitle>
                          <CardDescription className="text-zinc-400">{req.email}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10 gap-1">
                        <Clock className="h-3 w-3" /> Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="bg-zinc-950/50 rounded-lg p-4 mb-6 border border-zinc-800">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-zinc-500 block mb-1">Requested Role</span>
                          <span className="text-white font-medium capitalize">{req.requestedRole}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block mb-1">Organization</span>
                          <div className="flex items-center gap-2 text-white font-medium">
                            <Building className="h-3 w-3 text-[#e78a53]" />
                            {req.organizationName || 'N/A'}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-zinc-500 block mb-1">Request Date</span>
                          <span className="text-zinc-300">
                            {new Date(req.createdAt).toLocaleDateString('en-US', {
                              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {rejectingId === req._id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Rejection reason..."
                            className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleDecision(req._id, 'reject', rejectionReason)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRejectingId(null)
                              setRejectionReason('')
                            }}
                            className="border-zinc-700 text-zinc-300"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button 
                            onClick={() => setRejectingId(req._id)}
                            disabled={processingId === req._id}
                            variant="outline" 
                            className="flex-1 border-red-900/30 text-red-400 hover:bg-red-950 hover:text-red-300 hover:border-red-900/50"
                          >
                            {processingId === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                            Reject
                          </Button>
                          
                          <Button 
                            onClick={() => handleDecision(req._id, 'approve')}
                            disabled={processingId === req._id}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            {processingId === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}