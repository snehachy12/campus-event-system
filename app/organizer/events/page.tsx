"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { OrganizerSidebar } from "@/components/organizer-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Card, CardContent } from "@/components/ui/card"
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
    Calendar,
    MapPin,
    Users,
    Clock,
    IndianRupee,
    Edit3,
    Trash2,
    MoreVertical,
    Ticket
} from "lucide-react"

// --- Interfaces for Events ---
interface EventFormData {
    title: string
    eventType: string
    description: string
    venue: string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    fee: number
    maxParticipants: number
}

interface Event {
    _id: string
    title: string
    eventType: string
    description: string
    venue: string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    fee: number
    maxParticipants: number
    attendeeCount: number
    status: 'draft' | 'published' | 'cancelled'
}

const eventCategories = ["Academic", "Cultural", "Sports", "Workshop", "Seminar", "Hackathon", "Concert"]

export default function OrganizerEventsPage() {
    // --- State ---
    const [events, setEvents] = useState<Event[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    // Dialogs
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    
    // Selection
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

    // Form
    const [formData, setFormData] = useState<EventFormData>({
        title: "",
        eventType: "",
        description: "",
        venue: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        fee: 0,
        maxParticipants: 100
    })

    // --- Init ---
    useEffect(() => {
        const user = localStorage.getItem('currentUser')
        if (user) setCurrentUser(JSON.parse(user))
    }, [])

    useEffect(() => {
        if (currentUser) fetchEvents()
    }, [currentUser])

    // --- API ---
    const fetchEvents = async () => {
        try {
            const res = await fetch(`/api/events?organizerId=${currentUser._id}`)
            if (res.ok) {
                const data = await res.json()
                setEvents(data.events || [])
            }
        } catch (error) { console.error(error) }
        finally { setInitialLoading(false) }
    }

    const handleCreateEvent = async () => {
        if (!formData.title || !formData.startDate || !formData.venue) {
            toast({ title: "Error", description: "Please fill required fields", variant: "destructive" })
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...formData, 
                    organizerId: currentUser._id,
                    organizerName: `${currentUser.firstName} ${currentUser.lastName}`
                })
            })
            
            if (res.ok) {
                const data = await res.json()
                setEvents(prev => [data.event, ...prev])
                setIsCreateDialogOpen(false)
                resetForm()
                toast({ title: "Success", description: "Event created successfully!" })
            }
        } catch (error) { 
            toast({ title: "Error", description: "Failed to create event", variant: "destructive" })
        } finally { setLoading(false) }
    }

    const handleDeleteEvent = async () => {
        if (!selectedEvent) return
        setLoading(true)
        try {
            const res = await fetch(`/api/events?eventId=${selectedEvent._id}`, { method: 'DELETE' })
            if (res.ok) {
                setEvents(prev => prev.filter(e => e._id !== selectedEvent._id))
                setIsDeleteDialogOpen(false)
                toast({ title: "Deleted", description: "Event cancelled successfully" })
            }
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    // --- Helpers ---
    const resetForm = () => {
        setFormData({
            title: "", eventType: "", description: "", venue: "",
            startDate: "", startTime: "", endDate: "", endTime: "",
            fee: 0, maxParticipants: 100
        })
    }

    const handleEditSetup = (event: Event) => {
        setSelectedEvent(event)
        setFormData({
            title: event.title,
            eventType: event.eventType,
            description: event.description,
            venue: event.venue,
            startDate: event.startDate.split('T')[0], // Extract YYYY-MM-DD
            startTime: event.startTime,
            endDate: event.endDate ? event.endDate.split('T')[0] : "",
            endTime: event.endTime,
            fee: event.fee,
            maxParticipants: event.maxParticipants
        })
        setIsEditDialogOpen(true)
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return (
        <div className="min-h-screen bg-black flex">
            <OrganizerSidebar />

            <main className="flex-1 overflow-auto">
                <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10 px-8 py-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Events</h1>
                        <p className="text-zinc-400">Create and manage your campus events</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true) }} className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white">
                            <Plus className="h-4 w-4 mr-2" /> Create Event
                        </Button>
                        <UserMenu />
                    </div>
                </header>

                <div className="p-8">
                    {/* Events Grid */}
                    {initialLoading ? (
                        <div className="text-center py-20 text-zinc-500">Loading events...</div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-20">
                            <Calendar className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                            <p className="text-zinc-400">No events found. Start by creating one!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {events.map((event) => (
                                <Card key={event._id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors group">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <Badge className="bg-[#e78a53]/10 text-[#e78a53] border-[#e78a53]/30 mb-2">
                                                    {event.eventType}
                                                </Badge>
                                                <h3 className="text-xl font-bold text-white line-clamp-1">{event.title}</h3>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => handleEditSetup(event)}>
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-500/10" onClick={() => { setSelectedEvent(event); setIsDeleteDialogOpen(true) }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <p className="text-zinc-400 text-sm line-clamp-2 mb-4 h-10">{event.description}</p>

                                        <div className="space-y-2 text-sm text-zinc-300 border-t border-zinc-800 pt-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-[#e78a53]" />
                                                <span>{formatDate(event.startDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-[#e78a53]" />
                                                <span>{event.startTime} - {event.endTime}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-[#e78a53]" />
                                                <span className="truncate">{event.venue}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
                                            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                                                <Users className="h-3.5 w-3.5" />
                                                <span>{event.attendeeCount} / {event.maxParticipants} Joined</span>
                                            </div>
                                            <div className="flex items-center gap-1 font-bold text-white">
                                                {event.fee > 0 ? (
                                                    <><IndianRupee className="h-4 w-4" />{event.fee}</>
                                                ) : (
                                                    <span className="text-green-400">Free</span>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* --- Create/Edit Event Dialog --- */}
            <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
                if(!open) { setIsCreateDialogOpen(false); setIsEditDialogOpen(false); }
            }}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditDialogOpen ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label>Event Title *</Label>
                                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-zinc-900 border-zinc-700 mt-1" placeholder="e.g. Annual Tech Fest" />
                            </div>
                            
                            <div>
                                <Label>Category *</Label>
                                <Select value={formData.eventType} onValueChange={(val) => setFormData({...formData, eventType: val})}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-700 mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-700">
                                        {eventCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Venue *</Label>
                                <Input value={formData.venue} onChange={(e) => setFormData({...formData, venue: e.target.value})} className="bg-zinc-900 border-zinc-700 mt-1" placeholder="e.g. Auditorium" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date *</Label>
                                <Input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="bg-zinc-900 border-zinc-700 mt-1" />
                            </div>
                            <div>
                                <Label>Start Time *</Label>
                                <Input type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="bg-zinc-900 border-zinc-700 mt-1" />
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <Input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="bg-zinc-900 border-zinc-700 mt-1" />
                            </div>
                            <div>
                                <Label>End Time</Label>
                                <Input type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="bg-zinc-900 border-zinc-700 mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Ticket Price (₹) - 0 for Free</Label>
                                <Input type="number" value={formData.fee} onChange={(e) => setFormData({...formData, fee: parseInt(e.target.value) || 0})} className="bg-zinc-900 border-zinc-700 mt-1" />
                            </div>
                            <div>
                                <Label>Max Participants</Label>
                                <Input type="number" value={formData.maxParticipants} onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})} className="bg-zinc-900 border-zinc-700 mt-1" />
                            </div>
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-zinc-900 border-zinc-700 mt-1" rows={4} />
                        </div>

                        <Button onClick={handleCreateEvent} disabled={loading} className="w-full bg-[#e78a53] text-white mt-4">
                            {loading ? 'Saving...' : (isEditDialogOpen ? 'Update Event' : 'Publish Event')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* --- Delete Confirmation --- */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Event?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will cancel <strong>{selectedEvent?.title}</strong>. Registered students will be notified.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-zinc-700 bg-zinc-900 text-white">Keep Event</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteEvent} className="bg-red-600 hover:bg-red-700">Yes, Cancel It</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    )
}