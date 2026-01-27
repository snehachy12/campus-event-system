"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ParticipantSidebar } from "@/components/ui/participant-sidebar" 
import { UserMenu } from "@/components/user-menu"
import {
  Bell,
  Info,
  CalendarDays,
  MapPin,
  BookOpen,
  GraduationCap,
  Send,
  Bot,
  Loader2,
  Code,
  Clock
} from "lucide-react"

// --- Chat Interfaces ---
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ParticipantAiMentor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your Campus AI Mentor. I can help you with Event Schedules, Hackathon details, or Exam prep. What's on your mind?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
     const response = await fetch('/api/aimentor/', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          // CHANGE 1: Match the backend variable name ("prompt")
          prompt: inputValue, 
          
          // CHANGE 2: Pass context (You can make this dynamic later)
          eventContext: {
            eventName: "Tech Symposium 2026", 
            description: "A large tech conference",
            participants: "Students and Faculty"
          },
          currentSchedule: {} // Pass empty object if starting fresh
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "API Error");

      // CHANGE 3: Handle the JSON response
      // The backend returns a JSON object (schedule), but the Chat needs a String to display.
      // We convert the JSON schedule into a readable string for the chat bubble.
      const scheduleString = "Here is the generated schedule:\n" + 
        JSON.stringify(data.schedule, null, 2);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: scheduleString, 
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error("Chat error", error);
      // Optional: Show error in chat
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      <ParticipantSidebar/>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col h-screen">
        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10 shrink-0">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">AI Mentor</h1>
                <p className="text-zinc-400">Ask about Hackathons, Schedules, and Campus Life</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5 text-zinc-400" />
                </Button>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area - Split View */}
        <div className="flex-1 p-8 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            
            {/* Left Column: Chat Interface */}
            <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800 flex flex-col h-full overflow-hidden">
              <CardHeader className="border-b border-zinc-800 py-4 bg-zinc-900/80">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5 text-[#e78a53]" /> Chat
                </CardTitle>
              </CardHeader>
              
              {/* Chat Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-[#e78a53] text-white rounded-tr-none' 
                          : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700'
                      }`}
                    >
                      {msg.content}
                      <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-orange-100' : 'text-zinc-500'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 rounded-2xl rounded-tl-none px-4 py-3 border border-zinc-700 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 text-[#e78a53] animate-spin" />
                      <span className="text-zinc-400 text-xs">AI is thinking...</span>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Input Area */}
              <div className="p-4 bg-zinc-900 border-t border-zinc-800">
                <div className="relative flex items-center">
                  <Input 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., When is the Hackathon starting?"
                    className="pr-12 bg-zinc-950 border-zinc-800 focus-visible:ring-[#e78a53] h-12"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    size="icon" 
                    className="absolute right-1 top-1 h-10 w-10 bg-[#e78a53] hover:bg-[#e78a53]/90 text-white rounded-lg"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Right Column: Participant Suggestions */}
            <div className="space-y-6 overflow-y-auto pr-2">
              
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-md flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-400" /> Student Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-zinc-400 space-y-2">
                  <p>Ask me about:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Hackathon dates & problem statements</li>
                    <li>Detailed Event Schedules</li>
                    <li>Exam topics & Lab locations</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Suggested Queries */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider px-1">
                  Try Asking...
                </h3>
                <div className="space-y-3">
                  
                  {/* Hackathon Query */}
                  <div 
                    className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-lg hover:border-[#e78a53]/30 hover:bg-zinc-800 transition cursor-pointer group"
                    onClick={() => setInputValue("What are the upcoming Hackathons?")}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Code className="h-4 w-4 text-purple-400" />
                      <span className="text-white text-sm font-medium">Hackathons</span>
                    </div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">"What are the upcoming Hackathons?"</p>
                  </div>

                  {/* Schedule Query */}
                  <div 
                    className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-lg hover:border-[#e78a53]/30 hover:bg-zinc-800 transition cursor-pointer group"
                    onClick={() => setInputValue("Show me the schedule for the Tech Fest.")}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-white text-sm font-medium">Event Schedule</span>
                    </div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">"Show me the schedule for the Tech Fest."</p>
                  </div>

                  {/* Campus Map / Locations */}
                  <div 
                    className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-lg hover:border-[#e78a53]/30 hover:bg-zinc-800 transition cursor-pointer group"
                    onClick={() => setInputValue("Where is the Main Auditorium?")}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-green-400" />
                      <span className="text-white text-sm font-medium">Campus Map</span>
                    </div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">"Where is the Main Auditorium?"</p>
                  </div>

                  {/* Academics */}
                  <div 
                    className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-lg hover:border-[#e78a53]/30 hover:bg-zinc-800 transition cursor-pointer group"
                    onClick={() => setInputValue("Summarize the key topics for Data Structures.")}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-yellow-400" />
                      <span className="text-white text-sm font-medium">Study Help</span>
                    </div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">"Summarize the key topics for Data Structures."</p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}