
    setLoading(true)

    try {
      const res = await fetch('/api/organizer/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: currentUser._id || currentUser.id,
          capacity: Number(formData.capacity),
          price: Number(formData.price) || 0
        })
      })

      if (res.ok) {
        router.push('/organizer/dashboard')
      } else {
        alert("Failed to create event")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <OrganizerSidebar />

      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Host a New Event</h1>
          
          <form onSubmit={handleSubmit}>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* 1. BASIC INFO */}
                <div className="space-y-2">
                  <Label className="text-zinc-400">Event Title <span className="text-red-500">*</span></Label>
                  <Input 
                    name="title" 
                    placeholder="e.g. AI Innovation Summit 2026" 
                    className="bg-zinc-950 border-zinc-700 text-white"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Category <span className="text-red-500">*</span></Label>
                    <Select onValueChange={(val) => handleSelectChange('eventType', val)} defaultValue="workshop">
                      <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="technical">Technical Fest</SelectItem>
                        <SelectItem value="cultural">Cultural Fest</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="seminar">Seminar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400">Mode</Label>
                    <Select onValueChange={(val) => handleSelectChange('mode', val)} defaultValue="offline">
                      <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="offline">Offline (On Campus)</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 2. DYNAMIC FIELDS (CONDITIONAL) */}
                <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-semibold text-[#e78a53] uppercase tracking-wider">
                    {formData.eventType} Specifics
                  </h3>
                  
                  {formData.eventType === 'cultural' && (
                    <div className="space-y-2 animate-in fade-in">
                      <Label className="text-zinc-400">Event Theme</Label>
                      <Input 
                        name="theme" 
                        placeholder="e.g. Retro Bollywood, Met Gala" 
                        className="bg-zinc-900 border-zinc-700 text-white"
                        onChange={handleChange}
                      />
                    </div>
                  )}

                  {formData.eventType === 'technical' && (
                    <div className="space-y-2 animate-in fade-in">
                      <Label className="text-zinc-400">Tech Stack / Domain</Label>
                      <Input 
                        name="techStack" 
                        placeholder="e.g. Web3, AI/ML, Robotics" 
                        className="bg-zinc-900 border-zinc-700 text-white"
                        onChange={handleChange}
                      />
                    </div>
                  )}

                  {formData.eventType === 'workshop' && (
                    <div className="space-y-2 animate-in fade-in">
                      <Label className="text-zinc-400">Prerequisites</Label>
                      <Input 
                        name="prerequisites" 
                        placeholder="e.g. Laptop, Basic Python Knowledge" 
                        className="bg-zinc-900 border-zinc-700 text-white"
                        onChange={handleChange}
                      />
                    </div>
                  )}

                  {formData.eventType === 'sports' && (
                    <div className="space-y-2 animate-in fade-in">
                      <Label className="text-zinc-400">Sport Type</Label>
                      <Input 
                        name="sportType" 
                        placeholder="e.g. Cricket, Chess, E-Sports" 
                        className="bg-zinc-900 border-zinc-700 text-white"
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>

                {/* 3. LOGISTICS */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label className="text-zinc-400">Start Date</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <Input type="date" name="startDate" className="bg-zinc-950 border-zinc-700 text-white pl-10" required onChange={handleChange} />
                    </div>
                   </div>
                   <div className="space-y-2">
                    <Label className="text-zinc-400">End Date</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <Input type="date" name="endDate" className="bg-zinc-950 border-zinc-700 text-white pl-10" required onChange={handleChange} />
                    </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label className="text-zinc-400">Time (Start - End)</Label>
                    <div className="flex gap-2">
                       <Input type="time" name="startTime" className="bg-zinc-950 border-zinc-700 text-white" required onChange={handleChange} />
                       <Input type="time" name="endTime" className="bg-zinc-950 border-zinc-700 text-white" required onChange={handleChange} />
                    </div>
                   </div>
                   <div className="space-y-2">
                    <Label className="text-zinc-400">Venue / Location</Label>
                    <div className="relative">
                       <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                       <Input name="venue" placeholder="e.g. Main Auditorium" className="bg-zinc-950 border-zinc-700 text-white pl-10" required onChange={handleChange} />
                    </div>
                   </div>
                </div>

                {/* 4. CAPACITY & PRICE */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label className="text-zinc-400">Max Capacity</Label>
                    <div className="relative">
                       <Users className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                       <Input type="number" name="capacity" placeholder="100" className="bg-zinc-950 border-zinc-700 text-white pl-10" required onChange={handleChange} />
                    </div>
                   </div>
                   <div className="space-y-2">
                    <Label className="text-zinc-400">Ticket Price (₹)</Label>
                    <div className="relative">
                       <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                       <Input type="number" name="price" placeholder="0 for Free" className="bg-zinc-950 border-zinc-700 text-white pl-10" required onChange={handleChange} />
                    </div>
                   </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Description</Label>
                  <Textarea 
                    name="description" 
                    placeholder="Describe your event..." 
                    className="bg-zinc-950 border-zinc-700 text-white min-h-[120px]" 
                    required 
                    onChange={handleChange}
                  />
                </div>

                <Button type="submit" className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white h-12 text-lg font-semibold" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mr-2" /> : 'Publish Event'}
                </Button>

              </CardContent>
            </Card>
          </form>
        </div>
      </main>
    </div>
  )
}