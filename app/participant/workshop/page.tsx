"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ParticipantSidebar } from "@/components/ui/participant-sidebar"
import { UserMenu } from "@/components/user-menu"
import {
  Search,
  Code, // Bootcamps
  Calendar, // Workshops
  MapPin,
  Clock,
  IndianRupee,
  ArrowRight,
  Sparkles,
  BookOpen,
  Laptop
} from "lucide-react"

// Updated Interface: Only Workshops and Bootcamps
interface Opportunity {
  _id: string
  title: string
  provider: string 
  type: 'workshop' | 'bootcamp'
  category: string 
  location: string
  mode: 'online' | 'offline' | 'hybrid'
  duration: string
  startDate: string
  price?: string 
  skills: string[]
  description: string
  applicantsCount: number
  deadline: string
}

export default function ParticipantOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('All')

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockData: Opportunity[] = [
        {
          _id: '1',
          title: 'Generative AI & LLM Masterclass',
          provider: 'CS Department',
          type: 'workshop',
          category: 'Artificial Intelligence',
          location: 'Seminar Hall A',
          mode: 'offline',
          duration: '2 Days',
          startDate: '2024-03-15',
          price: 'Free',
          skills: ['Python', 'LangChain', 'OpenAI', 'RAG'],
          description: 'Deep dive into building custom chatbots using Large Language Models and vector databases.',
          applicantsCount: 145,
          deadline: '2024-03-10'
        },
        {
          _id: '2',
          title: 'Full Stack Web Dev Bootcamp',
          provider: 'Coding Club',
          type: 'bootcamp',
          category: 'Web Development',
          location: 'Lab 4, IT Building',
          mode: 'hybrid',
          duration: '6 Weeks',
          startDate: '2024-04-01',
          price: '₹1,500',
          skills: ['React', 'Next.js', 'Node.js', 'PostgreSQL'],
          description: 'Intensive zero-to-hero bootcamp building production-grade web applications.',
          applicantsCount: 89,
          deadline: '2024-03-25'
        },
        {
          _id: '3',
          title: 'Data Science & Analytics Zero to Hero',
          provider: 'DataWiz Community',
          type: 'bootcamp',
          category: 'Data Science',
          location: 'Online (Zoom)',
          mode: 'online',
          duration: '4 Weeks',
          startDate: '2024-03-28',
          price: '₹800',
          skills: ['Python', 'Pandas', 'Tableau', 'Statistics'],
          description: 'Comprehensive program covering data cleaning, visualization, and predictive modeling.',
          applicantsCount: 210,
          deadline: '2024-03-26'
        },
        {
          _id: '4',
          title: 'Cyber Security Essentials',
          provider: 'InfoSec Cell',
          type: 'workshop',
          category: 'Security',
          location: 'Main Auditorium',
          mode: 'offline',
          duration: '1 Day',
          startDate: '2024-03-20',
          price: 'Free',
          skills: ['Ethical Hacking', 'Network Security', 'Linux'],
          description: 'Learn the basics of penetration testing and how to secure web servers.',
          applicantsCount: 300,
          deadline: '2024-03-18'
        },
        {
          _id: '5',
          title: 'Cloud Computing with AWS',
          provider: 'Cloud Native Team',
          type: 'bootcamp',
          category: 'Cloud Infra',
          location: 'Lab 2',
          mode: 'offline',
          duration: '3 Weeks',
          startDate: '2024-04-15',
          price: '₹2,000',
          skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
          description: 'Prepare for AWS certification and learn to deploy scalable applications.',
          applicantsCount: 56,
          deadline: '2024-04-10'
        },
        {
          _id: '6',
          title: 'UI/UX Design Sprint',
          provider: 'Design Studio',
          type: 'workshop',
          category: 'Design',
          location: 'Creative Hub',
          mode: 'offline',
          duration: '3 Days',
          startDate: '2024-03-22',
          price: '₹300',
          skills: ['Figma', 'Prototyping', 'User Research'],
          description: 'Fast-paced workshop on designing intuitive mobile app interfaces.',
          applicantsCount: 78,
          deadline: '2024-03-20'
        },
      ]
      setOpportunities(mockData)
      setLoading(false)
    }

    fetchOpportunities()
  }, [])

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          opp.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = selectedType === 'All' || opp.type === selectedType.toLowerCase()
    return matchesSearch && matchesType
  })

  // Icons updated for Workshops vs Bootcamps
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'workshop': return <Calendar className="h-4 w-4" />
      case 'bootcamp': return <Code className="h-4 w-4" />
      default: return <Sparkles className="h-4 w-4" />
    }
  }

  // Colors updated
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'workshop': return "bg-blue-500/10 text-blue-400 border-blue-500/30"
      case 'bootcamp': return "bg-purple-500/10 text-purple-400 border-purple-500/30"
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <ParticipantSidebar />

      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Skill Building</h1>
                <p className="text-zinc-400">Join intensive bootcamps and hands-on workshops</p>
              </div>
              <div className="flex items-center gap-4">
                <Button className="bg-[#e78a53] text-white hover:bg-[#e78a53]/90">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Recommended for You
                </Button>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {/* Updated Filter List */}
              {["All", "Workshop", "Bootcamp"].map((type) => (
                <Badge
                  key={type}
                  variant="outline"
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 cursor-pointer transition-colors text-sm ${
                    selectedType === type
                      ? "bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]"
                      : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
                  }`}
                >
                  {type}
                </Badge>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search skills (e.g., Python, AWS)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400"
              />
            </div>
          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#e78a53] mx-auto"></div>
              <p className="text-zinc-400 mt-4">Loading programs...</p>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/30 rounded-lg border border-zinc-800">
              <Laptop className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-300 font-medium">No programs found</p>
              <p className="text-zinc-500 text-sm mt-1">Try searching for a different skill.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOpportunities.map((item) => (
                <Card key={item._id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all flex flex-col group">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-3">
                      <Badge className={`capitalize flex items-center gap-1 ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                        {item.type}
                      </Badge>
                      {item.mode && (
                        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded capitalize border border-zinc-700">
                          {item.mode}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-white text-lg group-hover:text-[#e78a53] transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-zinc-400 font-medium flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> {item.provider}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="space-y-4">
                      {/* Key Details */}
                      <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                          {item.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-zinc-500" />
                          {item.duration}
                        </div>
                        {item.price === 'Free' ? (
                          <div className="flex items-center gap-1.5 text-green-400 font-medium">
                            <IndianRupee className="h-3.5 w-3.5" />
                            Free
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[#e78a53] font-medium">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {item.price}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-zinc-500 line-clamp-2">
                        {item.description}
                      </p>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-2">
                        {item.skills.map((skill, i) => (
                          <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                    <div className="text-xs text-zinc-500">
                      <span className="text-zinc-300 font-medium">{item.applicantsCount}</span> enrolled
                      <span className="mx-2">•</span>
                      Starts {new Date(item.startDate).toLocaleDateString()}
                    </div>
                    <Button size="sm" className="bg-white text-black hover:bg-zinc-200">
                      Register <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}