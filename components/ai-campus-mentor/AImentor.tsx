"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, MapPin, Calendar, Clock, Bot, User, Sparkles, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Montserrat } from "next/font/google";
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";

// Ensure you have these ui components or use standard html elements with tailwind
// import { ScrollArea } from "@/components/ui/scroll-area"; 

const montserrat = Montserrat({ weight: "600", subsets: ["latin"] });

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const EventAssistantUI: React.FC = () => {
  // State for Chat functionality
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      text: "Hello! I'm your AI Event Concierge. Ask me about the schedule, speaker lineup, or venue details!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // CSS Animations (Kept from your original code)
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes blob {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      .animate-blob { animation: blob 7s infinite; }
      .animation-delay-2000 { animation-delay: 2s; }
      .animation-delay-4000 { animation-delay: 4s; }
      
      /* New animation for typing indicator */
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      .animate-bounce-dot { animation: bounce 0.6s infinite; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Mock AI Response Logic (Replace with real API call)
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI delay
    setTimeout(() => {
      let responseText = "I can help with that! Please check the event dashboard for more specific details.";
      
      const lowerInput = newUserMsg.text.toLowerCase();
      if (lowerInput.includes('schedule') || lowerInput.includes('time')) {
        responseText = "The event kicks off at 9:00 AM with the Keynote speech. Lunch is served at 12:30 PM.";
      } else if (lowerInput.includes('where') || lowerInput.includes('location') || lowerInput.includes('venue')) {
        responseText = "We are located at the Grand Convention Center, Hall B. Need directions?";
      } else if (lowerInput.includes('ticket') || lowerInput.includes('price')) {
        responseText = "Tickets are currently sold out for VIP, but General Admission is still open.";
      }

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newAiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9ff] to-[#f1f5ff] font-sans">
      
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden py-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#5C5FFF]/5 via-transparent to-[#00C2D1]/5" />
          <div className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(92, 95, 255, 0.08) 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />
        </div>
        
        {/* Animated Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#5C5FFF]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-48 -right-24 w-96 h-96 bg-[#FF647C]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-24 left-48 w-96 h-96 bg-[#00C2D1]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center z-10">
          <h1 className={cn("text-4xl font-bold tracking-tight mb-6", montserrat.className)}>
            <span className="text-[#5C5FFF] drop-shadow-[0_0_8px_rgba(92,95,255,0.2)]">Event</span>
            <span className="text-[#FF647C] drop-shadow-[0_0_8px_rgba(255,100,124,0.2)]"> Assistant</span>
          </h1>
          <p className="text-xl text-slate-700 max-w-2xl">
            Instant answers about schedules, speakers, and venue details.
          </p>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: CHAT INTERFACE (Takes up 2/3 width on large screens) */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm shadow-xl border-white/20 h-[600px] flex flex-col overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#5C5FFF] to-[#4a4ce6] text-white py-4 px-6 shrink-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5 text-white" />
                Live Concierge
              </CardTitle>
              <CardDescription className="text-indigo-100 text-xs">
                Ask anything about the event
              </CardDescription>
            </CardHeader>

            {/* Message Area */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar Bubble */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                      msg.role === 'user' ? "bg-[#5C5FFF] text-white" : "bg-white text-[#FF647C]"
                    )}>
                      {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                    </div>

                    {/* Text Bubble */}
                    <div className={cn(
                      "p-3 rounded-2xl text-sm shadow-sm",
                      msg.role === 'user' 
                        ? "bg-[#5C5FFF] text-white rounded-tr-none" 
                        : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                    )}>
                      {msg.text}
                      <div className={cn(
                        "text-[10px] mt-1 opacity-70",
                        msg.role === 'user' ? "text-indigo-100" : "text-slate-400"
                      )}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex w-full justify-start">
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-full bg-white text-[#FF647C] flex items-center justify-center shadow-sm">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1 items-center h-[44px]">
                      <div className="w-2 h-2 bg-[#FF647C]/60 rounded-full animate-bounce-dot [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-[#FF647C]/60 rounded-full animate-bounce-dot [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-[#FF647C]/60 rounded-full animate-bounce-dot"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input Area */}
            <CardFooter className="p-4 bg-white border-t border-slate-100 shrink-0">
              <form onSubmit={handleSendMessage} className="flex w-full gap-2 items-center">
                <Input 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your question..." 
                  className="bg-slate-50 border-slate-200 focus-visible:ring-[#5C5FFF]"
                />
                <Button 
                  type="submit" 
                  size="icon"
                  className="bg-[#5C5FFF] hover:bg-[#4a4ce6] transition-colors rounded-full shrink-0"
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>


          {/* RIGHT COLUMN: EVENT INFO (Static/Context) */}
          <div className="flex flex-col gap-6">
            
            {/* Quick Info Card */}
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-[#FF647C] text-white rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2 text-md">
                  <Info className="h-5 w-5" />
                  Event Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-[#5C5FFF]/10 rounded-lg p-2 text-[#5C5FFF]">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Today's Agenda</h3>
                    <p className="text-xs text-gray-500">Keynote at 9 AM, Workshops at 2 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-[#00C2D1]/10 rounded-lg p-2 text-[#00C2D1]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Venue Map</h3>
                    <p className="text-xs text-gray-500">Main Hall, Entrance B</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#FF647C]/10 rounded-lg p-2 text-[#FF647C]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Next Session</h3>
                    <p className="text-xs text-gray-500">Starts in 15 minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Queries */}
            <Card className="bg-white/50 border border-slate-100 shadow-sm">
              <CardContent className="pt-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Suggested Questions</h3>
                <div className="flex flex-col gap-2">
                  {["What time is lunch?", "Where is the main stage?", "Who is speaking next?"].map((q, i) => (
                    <button 
                      key={i}
                      onClick={() => { setInputValue(q); }}
                      className="text-left text-sm text-slate-600 hover:text-[#5C5FFF] hover:bg-[#5C5FFF]/5 p-2 rounded-md transition-colors flex items-center justify-between group"
                    >
                      {q}
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAssistantUI;