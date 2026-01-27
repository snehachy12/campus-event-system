"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TeacherSidebar } from "@/components/ui/participant-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import {
    Plus,
    Users,
    Clock,
    Calendar,
    BookOpen,
    Edit3,
    Trash2,
    Eye,
    UserCheck,
    FileText,
    Copy,
    MoreVertical
} from "lucide-react"

// --- Interfaces ---
interface ScheduleItem {
    day: string
    startTime: string
    endTime: string
}

interface ClassroomFormData {
    title: string
    subject: string
    description: string
    maxStudents: number
    schedule: ScheduleItem[]
}

interface Classroom {
    _id: string
    classroomId: string
    inviteCode: string
    title: string
    subject: string
    description: string
    maxStudents: number
    studentsCount: number
    schedule: ScheduleItem[]
    status: string
    createdAt: string
}

interface Student {
    studentId: string
    studentName: string
    studentEmail: string
    studentRollNumber?: string
    enrolledAt: string
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const subjects = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "English", "History"]

export default function TeacherClassroomPage() {
    // --- State ---
    const [classrooms, setClassrooms] = useState<Classroom[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    // Dialog States
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isStudentManageDialogOpen, setIsStudentManageDialogOpen] = useState(false)
    
    // Selection State
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
    const [classroomStudents, setClassroomStudents] = useState<Student[]>([])
    const [studentsLoading, setStudentsLoading] = useState(false)

    // Form State
    const [formData, setFormData] = useState<ClassroomFormData>({
        title: "", subject: "", description: "", maxStudents: 30, schedule: []
    })
    const [newSchedule, setNewSchedule] = useState<ScheduleItem>({ day: "", startTime: "", endTime: "" })

    // --- Effects ---
    useEffect(() => {
        const user = localStorage.getItem('currentUser')
        if (user) setCurrentUser(JSON.parse(user))
    }, [])

    useEffect(() => {
        if (currentUser) fetchClassrooms()
    }, [currentUser])

    // --- API Calls ---
    const fetchClassrooms = async () => {
        try {
            const res = await fetch(`/api/classrooms?teacherId=${currentUser._id}`)
            if (res.ok) {
                const data = await res.json()
                setClassrooms(data.classrooms || [])
            }
        } catch (error) { console.error(error) } 
        finally { setInitialLoading(false) }
    }

    const fetchStudents = async (classroomId: string) => {
        setStudentsLoading(true)
        try {
            const res = await fetch(`/api/classrooms/${classroomId}/students`)
            if (res.ok) {
                const data = await res.json()
                setClassroomStudents(data.students || [])
            }
        } catch (error) { console.error(error) }
        finally { setStudentsLoading(false) }
    }

    // --- Handlers ---
    const handleInputChange = (field: keyof ClassroomFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const addScheduleItem = () => {
        if (!newSchedule.day || !newSchedule.startTime || !newSchedule.endTime) return
        setFormData(prev => ({ ...prev, schedule: [...prev.schedule, newSchedule] }))
        setNewSchedule({ day: "", startTime: "", endTime: "" })
    }

    const removeScheduleItem = (index: number) => {
        setFormData(prev => ({ ...prev, schedule: prev.schedule.filter((_, i) => i !== index) }))
    }

    const handleCreateClassroom = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/classrooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, teacherId: currentUser._id })
            })
            
            if (res.ok) {
                const data = await res.json()
                setClassrooms(prev => [data.classroom, ...prev])
                setIsCreateDialogOpen(false)
                setFormData({ title: "", subject: "", description: "", maxStudents: 30, schedule: [] })
                toast({ title: "Success", description: "Classroom created!" })
            }
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    const handleDeleteClassroom = async () => {
        if (!selectedClassroom) return
        setLoading(true)
        try {
            const res = await fetch(`/api/classrooms?classroomId=${selectedClassroom._id}`, { method: 'DELETE' })
            if (res.ok) {
                setClassrooms(prev => prev.filter(c => c._id !== selectedClassroom._id))
                setIsDeleteDialogOpen(false)
                toast({ title: "Deleted", description: "Classroom removed successfully" })
            }
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    const handleRemoveStudent = async (studentId: string) => {
        if (!selectedClassroom) return
        try {
            const res = await fetch(`/api/classrooms/enroll`, { // Assuming enroll endpoint handles unenroll too via DELETE
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classroomId: selectedClassroom._id, studentId })
            })
            if (res.ok) {
                setClassroomStudents(prev => prev.filter(s => s.studentId !== studentId))
                // Update count locally
                setClassrooms(prev => prev.map(c => c._id === selectedClassroom._id ? {...c, studentsCount: c.studentsCount - 1} : c))
                toast({ title: "Removed", description: "Student removed from class" })
            }
        } catch (error) { console.error(error) }
    }

    const openManageStudents = (classroom: Classroom) => {
        setSelectedClassroom(classroom)
        setIsStudentManageDialogOpen(true)
        fetchStudents(classroom._id)
    }

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        toast({ title: "Copied!", description: "Invite code copied to clipboard" })
    }

    return (
        <div className="min-h-screen bg-black flex">
            <TeacherSidebar />

            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10 px-8 py-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Classrooms</h1>
                        <p className="text-zinc-400">Manage your courses and students</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white">
                            <Plus className="h-4 w-4 mr-2" /> Create Classroom
                        </Button>
                        <UserMenu />
                    </div>
                </header>

                <div className="p-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-lg"><BookOpen className="h-6 w-6 text-blue-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{classrooms.length}</p>
                                    <p className="text-zinc-400 text-sm">Active Classes</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-green-500/10 rounded-lg"><Users className="h-6 w-6 text-green-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {classrooms.reduce((acc, curr) => acc + curr.studentsCount, 0)}
                                    </p>
                                    <p className="text-zinc-400 text-sm">Total Students</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Classrooms Grid */}
                    {initialLoading ? (
                        <div className="text-center py-20 text-zinc-500">Loading classrooms...</div>
                    ) : classrooms.length === 0 ? (
                        <div className="text-center py-20">
                            <BookOpen className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                            <p className="text-zinc-400">No classrooms found. Create your first one!</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {classrooms.map((classroom) => (
                                <Card key={classroom._id} className="bg-zinc-900/50 border-zinc-800">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-white">{classroom.title}</h3>
                                                    <Badge className="bg-[#e78a53]/10 text-[#e78a53] border-[#e78a53]/30">{classroom.subject}</Badge>
                                                    <Badge variant="outline" className="text-zinc-400 cursor-pointer hover:bg-zinc-800" onClick={() => copyCode(classroom.inviteCode)}>
                                                        <Copy className="h-3 w-3 mr-1" /> {classroom.inviteCode}
                                                    </Badge>
                                                </div>
                                                <p className="text-zinc-400 text-sm line-clamp-2">{classroom.description}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => {
                                                    setSelectedClassroom(classroom)
                                                    setFormData({
                                                        title: classroom.title,
                                                        subject: classroom.subject,
                                                        description: classroom.description,
                                                        maxStudents: classroom.maxStudents,
                                                        schedule: classroom.schedule
                                                    })
                                                    setIsEditDialogOpen(true)
                                                }}>
                                                    <Edit3 className="h-4 w-4 text-zinc-400" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => {
                                                    setSelectedClassroom(classroom)
                                                    setIsDeleteDialogOpen(true)
                                                }}>
                                                    <Trash2 className="h-4 w-4 text-red-400" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-6 text-sm text-zinc-400 border-t border-zinc-800 pt-4 mt-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-[#e78a53]" />
                                                <span>{classroom.studentsCount} / {classroom.maxStudents} Students</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-[#e78a53]" />
                                                <span>{classroom.schedule.length} Weekly Sessions</span>
                                            </div>
                                            <div className="ml-auto flex gap-3">
                                                <Button variant="outline" size="sm" onClick={() => openManageStudents(classroom)}>
                                                    <UserCheck className="h-4 w-4 mr-2" /> Manage Students
                                                </Button>
                                                <Link href={`/teacher/classroom/${classroom._id}`}>
                                                    <Button size="sm" className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white">
                                                        Enter Class <Eye className="h-4 w-4 ml-2" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* --- Dialogs --- */}

            {/* Create Classroom Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[600px]">
                    <DialogHeader><DialogTitle>Create New Classroom</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Title</Label>
                                <Input value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} className="bg-zinc-900 border-zinc-700" placeholder="e.g. Adv Java" />
                            </div>
                            <div>
                                <Label>Subject</Label>
                                <Select onValueChange={(val) => handleInputChange('subject', val)}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-700"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-700">
                                        {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} className="bg-zinc-900 border-zinc-700" />
                        </div>
                        
                        {/* Schedule Builder */}
                        <div>
                            <Label>Schedule</Label>
                            <div className="flex gap-2 mt-2">
                                <Select onValueChange={(val) => setNewSchedule(p => ({...p, day: val}))}>
                                    <SelectTrigger className="w-[120px] bg-zinc-900 border-zinc-700"><SelectValue placeholder="Day" /></SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-700">{daysOfWeek.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                </Select>
                                <Input type="time" className="bg-zinc-900 border-zinc-700" onChange={(e) => setNewSchedule(p => ({...p, startTime: e.target.value}))} />
                                <Input type="time" className="bg-zinc-900 border-zinc-700" onChange={(e) => setNewSchedule(p => ({...p, endTime: e.target.value}))} />
                                <Button onClick={addScheduleItem} variant="outline"><Plus className="h-4 w-4" /></Button>
                            </div>
                            <div className="mt-2 space-y-1">
                                {formData.schedule.map((s, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm bg-zinc-900 p-2 rounded border border-zinc-800">
                                        <span>{s.day}: {s.startTime} - {s.endTime}</span>
                                        <Trash2 className="h-3 w-3 cursor-pointer text-red-400" onClick={() => removeScheduleItem(i)} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleCreateClassroom} disabled={loading} className="w-full bg-[#e78a53] text-white mt-4">
                            {loading ? 'Creating...' : 'Create Classroom'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Manage Students Dialog */}
            <Dialog open={isStudentManageDialogOpen} onOpenChange={setIsStudentManageDialogOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Manage Students - {selectedClassroom?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 max-h-[60vh] overflow-y-auto">
                        {studentsLoading ? (
                            <p className="text-center text-zinc-500">Loading students...</p>
                        ) : classroomStudents.length === 0 ? (
                            <p className="text-center text-zinc-500">No students enrolled yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {classroomStudents.map(student => (
                                    <div key={student.studentId} className="flex justify-between items-center p-3 bg-zinc-900 rounded border border-zinc-800">
                                        <div>
                                            <p className="font-medium text-white">{student.studentName}</p>
                                            <p className="text-xs text-zinc-500">{student.studentEmail}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => handleRemoveStudent(student.studentId)}>
                                            <Trash2 className="h-4 w-4 text-red-400" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Classroom?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{selectedClassroom?.title}</strong> and remove all student enrollments.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-zinc-700 bg-zinc-900 text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteClassroom} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    )
}