"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Building,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Hash,
  Globe,
  Award,
  Briefcase,
  Ticket,
  Users
} from "lucide-react"

export default function OrganizerSignupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  // Fields relevant to Event Organizers
  const requiredOrganizerFields = [
    'firstName', 'lastName', 'email', 'password', 'confirmPassword', 'phone', 
    'organizationName', 'organizerType', 'experienceYears', 'website'
  ]

  const [formData, setFormData] = useState({
    // Section 1: Personal Information
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",

    // Section 2: Organization Details
    organizationName: "",
    organizerType: "", // Individual, Company, Student Body, NGO
    website: "",
    linkedin: "",
    experienceYears: "",
    eventCategories: [] as string[],

    // Section 3: Professional Background
    pastEventsCount: "",
    averageAttendance: "",
    teamSize: "1",

    // Section 4: Branding & Bio
    bio: "",
    socialLinks: [] as string[],
    profilePicture: null as File | null,
  })

  const [newEventCategory, setNewEventCategory] = useState("")

  const organizerTypes = [
    "Individual Freelancer",
    "Private Event Company",
    "University Department",
    "Student Club/Society",
    "Non-Profit Organization",
    "Government Body"
  ]

  const eventCategorySuggestions = [
    "Technology", "Music", "Academic", "Sports", "Workshops", "Career Fair", "Cultural", "Gaming"
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addCategory = (cat?: string) => {
    const categoryToAdd = cat || newEventCategory
    if (categoryToAdd.trim() && !formData.eventCategories.includes(categoryToAdd.trim())) {
      setFormData(prev => ({ ...prev, eventCategories: [...prev.eventCategories, categoryToAdd.trim()] }))
      setNewEventCategory("")
    }
  }

  const removeCategory = (cat: string) => {
    setFormData(prev => ({ ...prev, eventCategories: prev.eventCategories.filter(c => c !== cat) }))
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    const missing = requiredOrganizerFields.filter((k) => !((formData as any)[k] && String((formData as any)[k]).trim().length))
    if (missing.length) {
      alert(`Please fill essential fields: ${missing.join(', ')}`)
      return
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/signup/organizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Signup failed')
        setIsLoading(false)
        return
      }
      window.location.href = '/organizer/dashboard'
    } catch (e: any) {
      alert('Network error')
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-white">
                <div className="p-2 bg-[#e78a53]/10 rounded-lg">
                  <User className="h-6 w-6 text-[#e78a53]" />
                </div>
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">First Name</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Last Name</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#e78a53]" />
                  Official Email
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="organizer@company.com"
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#e78a53]" />
                    Password
                  </Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Confirm</Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#e78a53]" />
                  Contact Number
                </Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="bg-background/50 border-border/50"
                />
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-white">
                <div className="p-2 bg-[#e78a53]/10 rounded-lg">
                  <Building className="h-6 w-6 text-[#e78a53]" />
                </div>
                Organization Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-foreground">Organization/Brand Name</Label>
                <Input
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  placeholder="e.g. TechVibe Events"
                  className="bg-background/50 border-border/50"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Organizer Type</Label>
                  <Select value={formData.organizerType} onValueChange={(v) => handleInputChange('organizerType', v)}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizerTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Years of Experience</Label>
                  <Input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                    placeholder="e.g. 3"
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#e78a53]" />
                  Website / Portfolio URL
                </Label>
                <Input
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.yourbrand.com"
                  className="bg-background/50 border-border/50"
                />
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-white">
                <div className="p-2 bg-[#e78a53]/10 rounded-lg">
                  <Ticket className="h-6 w-6 text-[#e78a53]" />
                </div>
                Event Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Past Events Hosted</Label>
                  <Input
                    type="number"
                    value={formData.pastEventsCount}
                    onChange={(e) => handleInputChange('pastEventsCount', e.target.value)}
                    placeholder="0"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Avg. Attendance</Label>
                  <Input
                    type="number"
                    value={formData.averageAttendance}
                    onChange={(e) => handleInputChange('averageAttendance', e.target.value)}
                    placeholder="e.g. 500"
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-foreground">Niche/Categories</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {eventCategorySuggestions.map(cat => (
                        <Badge 
                            key={cat} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-[#e78a53] hover:text-white"
                            onClick={() => addCategory(cat)}
                        >
                            + {cat}
                        </Badge>
                    ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value)}
                    placeholder="Add custom category"
                    className="bg-background/50 border-border/50"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                  />
                  <Button onClick={() => addCategory()} size="icon" className="bg-[#e78a53] hover:bg-[#e78a53]/90">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.eventCategories.map((cat) => (
                    <Badge key={cat} className="bg-[#e78a53] text-white">
                      {cat}
                      <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeCategory(cat)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-white">
                <div className="p-2 bg-[#e78a53]/10 rounded-lg">
                  <FileText className="h-6 w-6 text-[#e78a53]" />
                </div>
                Organizer Bio & Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-foreground">Organizer Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Briefly describe your event management background and mission..."
                  className="bg-background/50 border-border/50 min-h-[120px]"
                />
              </div>
              <div className="p-4 rounded-lg bg-[#e78a53]/5 border border-[#e78a53]/20">
                <p className="text-sm text-zinc-400">
                  <Users className="inline h-4 w-4 mr-2 text-[#e78a53]" />
                  Tip: A clear bio helps attendees and sponsors trust your brand.
                </p>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-[#e78a53]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#e78a53]/5 rounded-full blur-3xl" />

      <Link href="/signup" className="absolute top-6 left-6 z-20 text-zinc-400 hover:text-[#e78a53] flex items-center gap-2">
        <ChevronLeft className="w-5 h-5" /> Back
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Organizer Registration</h1>
          <p className="text-zinc-400">Start hosting world-class campus events</p>
        </div>

        {/* Stepper logic */}
        <div className="flex justify-center mb-8 gap-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep >= step ? 'bg-[#e78a53] border-[#e78a53] text-white' : 'border-zinc-600 text-zinc-600'}`}>
                {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
              </div>
              {step < 4 && <div className={`w-12 h-0.5 mx-2 ${currentStep > step ? 'bg-[#e78a53]' : 'bg-zinc-600'}`} />}
            </div>
          ))}
        </div>

        <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          {renderStep()}
        </motion.div>

        <div className="flex justify-between">
          <Button onClick={prevStep} disabled={currentStep === 1} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          {currentStep < 4 ? (
            <Button onClick={nextStep} className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white">
              Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading} className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white">
              {isLoading ? "Setting up..." : "Launch Organizer Account"}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}