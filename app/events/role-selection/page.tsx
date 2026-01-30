"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StudentSidebar } from "@/components/student-sidebar"
import { CheckCircle2, User, Crown, Loader2, ArrowLeft, Building2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function EventRoleSelectionPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'participant' | 'organizer' | null>(null)
  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
  }, [])

  const handleRoleConfirm = async () => {
    console.log('handleRoleConfirm called:', { selectedRole, currentUser, orgName })
    
    if (!selectedRole) {
      console.log('No role selected')
      return
    }
    
    if (!currentUser) {
      console.log('No current user')
      alert('Please log in first')
      return
    }
    
    if (selectedRole === 'organizer' && !orgName.trim()) {
      console.log('No org name provided')
      return
    }

    console.log('Proceeding with role:', selectedRole)
    setLoading(true)

    if (selectedRole === 'participant') {
      // 1. Participant Logic -> Save persona and go to Dashboard
      console.log('Switching to participant')
      localStorage.setItem('selectedPersona', 'participant')
      setTimeout(() => {
        router.push('/partcipant/dashboard') 
      }, 300)
    } else {
      // 2. Organizer Logic -> Request Role -> Go to Pending Page
      console.log('Submitting organizer request')
      try {
        const userId = currentUser._id || currentUser.id
        console.log('Sending request with userId:', userId)
        
        const response = await fetch('/api/user/request-organizer-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: userId,
            organizationName: orgName 
          }),
        })
        
        console.log('API response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('API response:', data)
          // Update localStorage with new user data
          const updatedUser = { ...currentUser, organizationName: orgName, roleRequestStatus: 'pending' }
          localStorage.setItem('currentUser', JSON.stringify(updatedUser))
          localStorage.setItem('selectedPersona', 'organizer')
          // ✅ REDIRECT TO PENDING PAGE
          console.log('Redirecting to pending approval')
          router.push('/organizer/pending-approval')
        } else {
          const error = await response.json()
          console.error("Failed to submit request:", error)
          alert(error.error || 'Failed to submit organizer request')
          setLoading(false)
        }
      } catch (error) {
        console.error("Error requesting role:", error)
        alert('Error submitting organizer request: ' + (error instanceof Error ? error.message : String(error)))
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <StudentSidebar />
      <main className="flex-1 flex flex-col overflow-auto">
        <div className="p-8">
          <Link href="/partcipant/dashboard" className="flex items-center text-zinc-500 hover:text-white mb-8 transition-colors w-fit">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Link>

          <div className="max-w-5xl mx-auto mt-8">
            <div className="text-center mb-12 space-y-4">
              <h1 className="text-4xl font-bold text-white">Choose Your Path</h1>
              <p className="text-zinc-400 text-lg">Select how you want to interact with the campus ecosystem.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Participant Option */}
              <div 
                onClick={() => setSelectedRole('participant')}
                className={`cursor-pointer transition-all duration-300 transform ${
                    selectedRole === 'participant' ? 'scale-105 ring-2 ring-blue-500' : 'hover:scale-[1.02] hover:border-zinc-700'
                } rounded-xl`}
              >
                <Card className={`h-full bg-zinc-900/50 border-2 ${
                    selectedRole === 'participant' ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-800'
                }`}>
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                        selectedRole === 'participant' ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      <User className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-white text-2xl">Participant</CardTitle>
                    <CardDescription className="text-zinc-400 text-base">Explore, Register, and Attend</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4 text-zinc-300 text-sm mb-8">
                      <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-500" /> Browse all campus events</li>
                      <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-500" /> Book tickets instantly</li>
                      <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-500" /> Track participation history</li>
                    </ul>
                    <div className="mt-auto pt-6 border-t border-zinc-800">
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1">Standard Access</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Organizer Option */}
              <div 
                onClick={() => setSelectedRole('organizer')}
                className={`cursor-pointer transition-all duration-300 transform ${
                    selectedRole === 'organizer' ? 'scale-105 ring-2 ring-[#e78a53]' : 'hover:scale-[1.02] hover:border-zinc-700'
                } rounded-xl`}
              >
                <Card className={`h-full bg-zinc-900/50 border-2 ${
                    selectedRole === 'organizer' ? 'border-[#e78a53] bg-[#e78a53]/5' : 'border-zinc-800'
                }`}>
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                        selectedRole === 'organizer' ? 'bg-[#e78a53] text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      <Crown className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-white text-2xl">Organizer</CardTitle>
                    <CardDescription className="text-zinc-400 text-base">Create, Manage, and Lead</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4 text-zinc-300 text-sm mb-8">
                      <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-[#e78a53]" /> Publish new events & workshops</li>
                      <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-[#e78a53]" /> Manage bookings & attendees</li>
                      <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-[#e78a53]" /> Access analytics dashboard</li>
                    </ul>
                    <div className="mt-auto pt-6 border-t border-zinc-800">
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 px-3 py-1">Approval Required</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Dynamic Input for Organization Name */}
            <div className="max-w-md mx-auto space-y-6">
              {selectedRole === 'organizer' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <Label className="text-white">Organization / Club Name <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input 
                      placeholder="e.g. Coding Club, Debate Society" 
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="bg-zinc-900 border-zinc-700 text-white pl-10 focus:border-[#e78a53] focus:ring-[#e78a53]"
                    />
                  </div>
                  <p className="text-xs text-zinc-500">This name will be displayed on your events.</p>
                </div>
              )}

              <Button 
                size="lg" 
                onClick={handleRoleConfirm}
                disabled={!selectedRole || loading || (selectedRole === 'organizer' && !orgName.trim())}
                className={`w-full h-12 text-lg font-semibold transition-all ${
                  !selectedRole || (selectedRole === 'organizer' && !orgName.trim())
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                    : selectedRole === 'organizer' 
                    ? 'bg-[#e78a53] hover:bg-[#e78a53]/90 text-white shadow-[0_0_20px_rgba(231,138,83,0.3)]' 
                    : selectedRole === 'participant'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : 'Confirm Selection'}
              </Button>
              
              <p className="text-zinc-500 text-xs text-center">
                By confirming, you agree to the platform's terms of service regarding role responsibilities.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}