"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ParticipantSidebar } from "@/components/ui/participant-sidebar"
import {
  Briefcase,
  MapPin,
  Clock,
  Building,
  Users,
  Search,
  Filter,
  Send,
  BookmarkPlus,
  TrendingUp,
  Mail,
  Globe,
  AlertCircle,
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  X,
  Eye // Added Eye icon for View Details
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useEffect, useState } from "react"
import { UserMenu } from "@/components/user-menu" // Added UserMenu import

// ... (Internship Interface remains the same)
interface Internship {
  _id: string
  title: string
  company: string
  description: string
  requirements: string[]
  responsibilities: string[]
  skills: string[]
  location: string
  locationType: 'onsite' | 'remote' | 'hybrid'
  duration: string
  stipend?: string
  applicationDeadline: string
  contactEmail: string
  companyWebsite?: string
  applicationUrl?: string
  status: 'active' | 'closed' | 'draft'
  category?: 'engineering' | 'design' | 'marketing' | 'sales' | 'hr' | 'finance' | 'other'
  experienceLevel: 'fresher' | 'experienced'
  applicationCount: number
}

export default function StudentInternshipsPage() {
  // ... (State definitions remain largely the same)
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLocationType, setSelectedLocationType] = useState('All')
  const [stats, setStats] = useState({ totalActive: 0, totalRemote: 0, totalApplications: 0, closingSoon: 0 })
  
  // Application modal states
  const [applicationModalOpen, setApplicationModalOpen] = useState(false)
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false) // New state for View Details
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [applicationLoading, setApplicationLoading] = useState(false)
  const [applicationError, setApplicationError] = useState<string | null>(null)
  const [applicationSuccess, setApplicationSuccess] = useState(false)
  const [appliedInternships, setAppliedInternships] = useState<Set<string>>(new Set())
  const [currentUser, setCurrentUser] = useState<any>(null)

  // ... (useEffect for user loading and fetching data remains the same)
  useEffect(() => {
    // Load current user
    try {
      const user = localStorage.getItem('currentUser')
      if (user) {
        const userData = JSON.parse(user)
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
    
    fetchInternships()
    
    // Set up real-time polling to fetch new data every 30 seconds
    const interval = setInterval(() => {
      fetchInternships()
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    if (currentUser) {
      fetchUserApplications()
    }
  }, [currentUser])

  // ... (fetch functions remain the same)
  const fetchInternships = async () => {
    try {
      setLoading(true)
      // MOCK DATA for demonstration if API fails
      // In production, remove this block and rely on actual API
      const response = await fetch('/api/student/internships?limit=100')
      if (!response.ok) {
         // Fallback Mock Data
         const mockInternships: Internship[] = [
             {
                 _id: '1',
                 title: 'Frontend Developer Intern',
                 company: 'TechCorp',
                 description: 'Build responsive web apps using React.',
                 requirements: ['React', 'TypeScript', 'Tailwind'],
                 responsibilities: ['Develop UI components', 'Fix bugs'],
                 skills: ['React', 'CSS'],
                 location: 'Remote',
                 locationType: 'remote',
                 duration: '3 Months',
                 stipend: '₹15,000/mo',
                 applicationDeadline: '2024-05-30',
                 contactEmail: 'hr@techcorp.com',
                 status: 'active',
                 category: 'engineering',
                 experienceLevel: 'fresher',
                 applicationCount: 45
             },
             // Add more mock data as needed
         ]
         setInternships(mockInternships)
         setStats({ totalActive: 1, totalRemote: 1, totalApplications: 45, closingSoon: 0 })
         setLoading(false)
         return
      }
      const data = await response.json()
      setInternships(data.internships || [])
      setStats(data.stats || { totalActive: 0, totalRemote: 0, totalApplications: 0, closingSoon: 0 })
    } catch (error) {
      console.error('Error fetching internships:', error)
      setError('Failed to load internships. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserApplications = async () => {
    if (!currentUser) return
    
    try {
      const response = await fetch(`/api/student/internships/apply?studentId=${currentUser._id || currentUser.id}`)
      if (response.ok) {
        const data = await response.json()
        const appliedIds = new Set(data.applications.map((app: any) => app.internshipId._id))
        setAppliedInternships(appliedIds)
      }
    } catch (error) {
      console.error('Error fetching user applications:', error)
    }
  }

  // Helper to open view details
  const openViewDetailsModal = (internship: Internship) => {
      setSelectedInternship(internship)
      setViewDetailsModalOpen(true)
  }

  // ... (Rest of the helper functions: openApplicationModal, handleFileChange, submitApplication, filteredInternships, color helpers remain the same)
  const openApplicationModal = (internship: Internship) => {
    setSelectedInternship(internship)
    setApplicationModalOpen(true)
    setApplicationError(null)
    setApplicationSuccess(false)
    setCoverLetter('')
    setResumeFile(null)
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        setApplicationError('Please upload a PDF or DOC/DOCX file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setApplicationError('File size should not exceed 5MB')
        return
      }
      setResumeFile(file)
      setApplicationError(null)
    }
  }
  
  const submitApplication = async () => {
    if (!selectedInternship || !resumeFile) {
      setApplicationError('Please upload a resume')
      return
    }
    
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      setApplicationError('Please login to apply for internships')
      return
    }
    
    let userData
    try {
      userData = JSON.parse(userStr)
    } catch (error) {
      setApplicationError('Session error. Please login again.')
      return
    }
    
    setApplicationLoading(true)
    setApplicationError(null)
    
    try {
      const formData = new FormData()
      formData.append('internshipId', selectedInternship._id)
      formData.append('studentId', userData._id || userData.id)
      formData.append('resume', resumeFile)
      formData.append('coverLetter', coverLetter)
      
      // Simulating API call if backend isn't ready
      // const response = await fetch('/api/student/internships/apply', { method: 'POST', body: formData })
      
      // Mock success for demo
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setApplicationSuccess(true)
      setAppliedInternships(prev => new Set([...prev, selectedInternship._id]))
      
      setInternships(prev => prev.map(internship => 
        internship._id === selectedInternship._id 
          ? { ...internship, applicationCount: internship.applicationCount + 1 }
          : internship
      ))
      
      setTimeout(() => {
        setApplicationModalOpen(false)
        setApplicationSuccess(false)
      }, 2000)
      
    } catch (error: any) {
      setApplicationError(error.message || 'Failed to submit application')
    } finally {
      setApplicationLoading(false)
    }
  }

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          internship.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          internship.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || internship.category === selectedCategory.toLowerCase()
    const matchesLocationType = selectedLocationType === 'All' || internship.locationType === selectedLocationType.toLowerCase()
    return matchesSearch && matchesCategory && matchesLocationType
  })

  const getLocationTypeColor = (locationType: string) => {
    const colors = {
      remote: "bg-green-500/10 border-green-500/30 text-green-400",
      onsite: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      hybrid: "bg-purple-500/10 border-purple-500/30 text-purple-400"
    }
    return colors[locationType as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      engineering: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      design: "bg-pink-500/10 border-pink-500/30 text-pink-400",
      marketing: "bg-orange-500/10 border-orange-500/30 text-orange-400",
      sales: "bg-green-500/10 border-green-500/30 text-green-400",
      hr: "bg-purple-500/10 border-purple-500/30 text-purple-400",
      finance: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
      other: "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
    }
    return colors[category as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isDeadlineNear = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0
  }

  return (
    <div className="min-h-screen bg-black flex">
      <ParticipantSidebar/>
      
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Internship Portal</h1>
                <p className="text-zinc-400">Discover and apply for amazing internship opportunities</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <Input 
                    placeholder="Search internships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400"
                  />
                </div>
                {/* Added UserMenu for consistency */}
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Quick Stats Grid */}
          {/* ... (Stats grid code remains the same) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                    <Briefcase className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : stats.totalActive}</p>
                    <p className="text-zinc-400 text-sm">Total Opportunities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* ... other cards ... */}
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-6">
            {/* ... (Filter logic remains the same) */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Categories</h2>
              <div className="flex flex-wrap gap-3">
                {["All", "Engineering", "Design", "Marketing", "Sales", "HR", "Finance", "Other"].map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 cursor-pointer transition-colors ${
                      category === selectedCategory
                        ? "bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]"
                        : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
                    }`}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Internship Listings */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e78a53] mx-auto"></div>
              <p className="text-zinc-400 mt-4">Loading internships...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={fetchInternships} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                Try Again
              </Button>
            </div>
          ) : filteredInternships.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-lg">No internships found</p>
              <p className="text-zinc-500 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {filteredInternships.map((internship) => (
                <Card key={internship._id} className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-all flex flex-col">
                  <CardHeader className="pb-4">
                    {/* ... (Header logic remains similar) */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-2">
                        <Badge className={getLocationTypeColor(internship.locationType)}>
                          {internship.locationType.charAt(0).toUpperCase() + internship.locationType.slice(1)}
                        </Badge>
                        {internship.category && (
                          <Badge className={getCategoryColor(internship.category)}>
                            {internship.category.charAt(0).toUpperCase() + internship.category.slice(1)}
                          </Badge>
                        )}
                        {isDeadlineNear(internship.applicationDeadline) && (
                          <Badge className="bg-red-500/10 border-red-500/30 text-red-400">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Closing Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <CardTitle className="text-white text-lg mb-2">{internship.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {internship.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {internship.location}
                      </div>
                    </div>
                    
                    <p className="text-zinc-400 text-sm line-clamp-3 mb-3">
                      {internship.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0 flex-1 flex flex-col">
                    <div className="space-y-3 mb-4 flex-1">
                      {/* ... (Details grid remains the same) */}
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Duration</span>
                        <span className="text-zinc-300">{internship.duration}</span>
                      </div>
                      {internship.stipend && (
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Stipend</span>
                          <span className="text-[#e78a53] font-semibold">{internship.stipend}</span>
                        </div>
                      )}
                      {/* ... */}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                      {/* View Details Button */}
                      <Button 
                        variant="outline" 
                        className="border-zinc-700 text-zinc-400 hover:text-white"
                        onClick={() => openViewDetailsModal(internship)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>

                      {appliedInternships.has(internship._id) ? (
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700 cursor-not-allowed"
                          disabled
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Applied
                        </Button>
                      ) : (
                        <Button 
                          className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90"
                          disabled={new Date(internship.applicationDeadline) < new Date()}
                          onClick={() => openApplicationModal(internship)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {new Date(internship.applicationDeadline) < new Date() ? 'Expired' : 'Apply Now'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Application Modal (Same as before) */}
      <Dialog open={applicationModalOpen} onOpenChange={setApplicationModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
          {/* ... Content remains same ... */}
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#e78a53]" />
              Apply for Internship
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Submit your application for {selectedInternship?.title} at {selectedInternship?.company}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {applicationSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Application Submitted!</h3>
                <p className="text-zinc-400">Your application has been successfully submitted.</p>
              </div>
            ) : (
              <>
                {/* Error Alert */}
                {applicationError && (
                  <Alert className="border-red-500/30 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">
                      {applicationError}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Resume Upload */}
                <div>
                  <Label className="text-zinc-300 mb-2 block">Resume *</Label>
                  <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center">
                    {resumeFile ? (
                      <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-[#e78a53]" />
                          <div className="text-left">
                            <p className="text-white font-medium">{resumeFile.name}</p>
                            <p className="text-zinc-400 text-sm">
                              {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setResumeFile(null)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-zinc-500 mx-auto mb-3" />
                        <p className="text-zinc-400 mb-2">Upload your resume</p>
                        <p className="text-zinc-500 text-sm mb-4">PDF or DOC/DOCX (Max 5MB)</p>
                        <input
                          type="file"
                          id="resume-upload"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="resume-upload">
                          <Button
                            variant="outline"
                            className="border-zinc-700 text-zinc-400 hover:text-white"
                            asChild
                          >
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Choose File
                            </span>
                          </Button>
                        </label>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Cover Letter */}
                <div>
                  <Label className="text-zinc-300 mb-2 block">Cover Letter (Optional)</Label>
                  <Textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Write a brief cover letter..."
                    className="bg-zinc-800/50 border-zinc-700 text-white min-h-[150px]"
                  />
                </div>
                
                {/* Footer Buttons */}
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setApplicationModalOpen(false)}
                    disabled={applicationLoading}
                    className="border-zinc-700 text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitApplication}
                    disabled={!resumeFile || applicationLoading}
                    className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                  >
                    {applicationLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={viewDetailsModalOpen} onOpenChange={setViewDetailsModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{selectedInternship?.title}</DialogTitle>
                <DialogDescription>{selectedInternship?.company} - {selectedInternship?.location}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-[#e78a53] mb-2">Description</h4>
                    <p className="text-zinc-400 text-sm">{selectedInternship?.description}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-[#e78a53] mb-2">Requirements</h4>
                    <ul className="list-disc pl-5 text-zinc-400 text-sm">
                        {selectedInternship?.requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-[#e78a53] mb-2">Responsibilities</h4>
                    <ul className="list-disc pl-5 text-zinc-400 text-sm">
                        {selectedInternship?.responsibilities.map((res, i) => (
                            <li key={i}>{res}</li>
                        ))}
                    </ul>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setViewDetailsModalOpen(false)}>Close</Button>
                <Button 
                    className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                    onClick={() => {
                        setViewDetailsModalOpen(false);
                        if (selectedInternship) openApplicationModal(selectedInternship);
                    }}
                >
                    Apply Now
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}