"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
    FileText,
    Image,
    Download,
    ArrowLeft,
    Search,
    RefreshCw,
    Calendar,
    Eye
} from "lucide-react"

interface Material {
    _id: string
    teacherId: {
        _id: string
        name: string
        email: string
    }
    classroomId: {
        _id: string
        title: string
        subject: string
    }
    title: string
    description: string
    fileName: string
    fileType: 'pdf' | 'image'
    mimeType: string
    fileSize: number
    formattedFileSize: string
    downloadCount: number
    tags: string[]
    createdAt: string
    updatedAt: string
}

interface Classroom {
    _id: string
    title: string
    subject: string
    teacherName: string
}

export default function StudentMaterialsPage() {
    const searchParams = useSearchParams()
    const classroomParam = searchParams.get('classroom')

    const [materials, setMaterials] = useState<Material[]>([])
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [selectedClassroom, setSelectedClassroom] = useState<string>(classroomParam || "")
    const [filterType, setFilterType] = useState<string>("")
    const [searchQuery, setSearchQuery] = useState("")
    const [classroom, setClassroom] = useState<Classroom | null>(null)
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)

    useEffect(() => {
        try {
            const user = localStorage.getItem('currentUser')
            if (user) {
                const userData = JSON.parse(user)
                setCurrentUser(userData)
            }
        } catch (error) {
            console.error('Error loading user data:', error)
        }
    }, [])

    useEffect(() => {
        if (currentUser) {
            fetchMaterials(selectedClassroom, filterType)
        }
    }, [currentUser])

    const fetchMaterials = async (classroomId?: string, fileType?: string) => {
        if (!currentUser) return

        setLoading(true)
        try {
            const params = new URLSearchParams({
                studentId: currentUser._id || currentUser.id,
            })

            if (classroomId) params.append('classroomId', classroomId)
            if (fileType) params.append('fileType', fileType)

            const response = await fetch(`/api/student/materials?${params}`)

            if (response.ok) {
                const data = await response.json()
                setMaterials(data.materials || [])
                setEnrollments(data.enrollments || [])
                setClassroom(data.classroom || null)
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch materials",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error('Error fetching materials:', error)
            toast({
                title: "Error",
                description: "Network error. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
            setInitialLoading(false)
        }
    }

    const handleClassroomChange = (classroomId: string) => {
        setSelectedClassroom(classroomId)
        fetchMaterials(classroomId, filterType)
    }

    const handleFilterChange = (fileType: string) => {
        setFilterType(fileType)
        fetchMaterials(selectedClassroom, fileType)
    }

    const handleDownload = async (material: Material) => {
        try {
            const response = await fetch(`/api/student/materials/${material._id}/download?studentId=${currentUser._id || currentUser.id}`)

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = material.fileName
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)

                toast({
                    title: "Success",
                    description: "File downloaded successfully"
                })

                // Refresh materials to update download count
                fetchMaterials(selectedClassroom, filterType)
            } else {
                toast({
                    title: "Error",
                    description: "Failed to download file",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Network error. Please try again.",
                variant: "destructive"
            })
        }
    }

    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'pdf':
                return <FileText className="h-8 w-8 text-red-400" />
            case 'image':
                return <Image className="h-8 w-8 text-blue-400" />
            default:
                return <FileText className="h-8 w-8 text-zinc-400" />
        }
    }

    const filteredMaterials = materials.filter(material =>
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="min-h-screen bg-black flex">
            <StudentSidebar />

            <main className="flex-1 overflow-auto">
                <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
                    <div className="px-8 py-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Link href="/student/classroom">
                                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">Study Materials</h1>
                                    <p className="text-zinc-400">Access course materials and resources</p>
                                </div>
                            </div>
                            <UserMenu />
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {initialLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e78a53] mx-auto"></div>
                            <p className="text-zinc-400 mt-2">Loading...</p>
                        </div>
                    ) : (
                        <>
                            {/* Controls */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-white text-sm">Select Classroom</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Select value={selectedClassroom} onValueChange={handleClassroomChange}>
                                            <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                                                <SelectValue placeholder="Choose a classroom" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-800 border-zinc-700">
                                                {enrollments.map((enrollment) => (
                                                    <SelectItem key={enrollment.classroomId._id} value={enrollment.classroomId._id} className="text-white hover:bg-zinc-700">
                                                        {enrollment.classroomId.title} ({enrollment.classroomId.subject})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </CardContent>
                                </Card>

                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-white text-sm">Filter by Type</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <Select value={filterType} onValueChange={handleFilterChange}>
                                                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                                                    <SelectValue placeholder="Filter by file type" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-800 border-zinc-700">
                                                    <SelectItem value="pdf" className="text-white hover:bg-zinc-700">PDFs Only</SelectItem>
                                                    <SelectItem value="image" className="text-white hover:bg-zinc-700">Images Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {filterType && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleFilterChange("")}
                                                    className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                                                >
                                                    Clear Filter
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-white text-sm">Search</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <Input
                                                placeholder="Search materials..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 bg-zinc-800/50 border-zinc-700 text-white"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Refresh Button */}
                            {selectedClassroom && (
                                <div className="flex gap-4 mb-6">
                                    <Button
                                        variant="outline"
                                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                        onClick={() => fetchMaterials(selectedClassroom, filterType)}
                                        disabled={loading}
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                </div>
                            )}

                            {/* Materials List */}
                            {!selectedClassroom ? (
                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardContent className="p-12">
                                        <div className="text-center">
                                            <FileText className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">Select a Classroom</h3>
                                            <p className="text-zinc-400">
                                                Choose a classroom from the dropdown above to view available materials.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : filteredMaterials.length === 0 ? (
                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardContent className="p-12">
                                        <div className="text-center">
                                            <FileText className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">No Materials Found</h3>
                                            <p className="text-zinc-400">
                                                {searchQuery ? 'No materials match your search criteria.' : 'No materials have been uploaded for this classroom yet.'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMaterials.map((material) => (
                                        <Card key={material._id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {getFileIcon(material.fileType)}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-white font-medium truncate">{material.title}</h3>
                                                            <p className="text-zinc-400 text-sm">{material.fileName}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={material.fileType === 'pdf' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}>
                                                        {material.fileType.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-zinc-300 text-sm mb-4 line-clamp-3">{material.description}</p>

                                                {material.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-4">
                                                        {material.tags.map((tag, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
                                                    <span>{material.formattedFileSize}</span>
                                                    <span>{material.downloadCount} downloads</span>
                                                    <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs text-zinc-500">
                                                        <p>By: {material.teacherId.name}</p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleDownload(material)}
                                                        className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                                                    >
                                                        <Download className="h-3 w-3 mr-1" />
                                                        Download
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
