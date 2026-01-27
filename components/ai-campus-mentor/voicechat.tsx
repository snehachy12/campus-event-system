'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  X, 
  Loader2, 
  PhoneCall, // Changed from PhoneOff to PhoneCall with rotation for "End Call" style
  Activity   // Used instead of AudioLines for better compatibility
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils'; // Ensure you have this utility, or remove 'cn' usage

export default function VoiceChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'error'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number[]>([10, 20, 15, 30, 20]);

  // Mock Audio Visualizer Animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'speaking' || status === 'listening') {
      interval = setInterval(() => {
        setVolume(Array.from({ length: 5 }, () => Math.floor(Math.random() * 40) + 10));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [status]);

  const startSession = async () => {
    setStatus('connecting');
    
    try {
      // 1. Simulate Connection Delay
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      // 2. Request Mic (This actually triggers the browser permission popup)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if(stream) {
          setStatus('listening');
      }
    } catch (error) {
      console.error("Mic Error", error);
      setStatus('error');
    }
  };

  const endSession = () => {
    setStatus('idle');
    setIsOpen(false);
    // Stop tracks if you had stored the stream
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (open) {
            setIsOpen(true);
            startSession();
        } else {
            endSession();
        }
    }}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-gradient-to-r from-[#e78a53] to-[#d97740] hover:from-[#d97740] hover:to-[#c56630] text-black font-semibold h-12 shadow-lg shadow-orange-900/20 transition-all active:scale-[0.98]"
        >
          <Mic className="mr-2 h-5 w-5" />
          Start Voice Chat
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl p-0 gap-0 overflow-hidden">
        
        {/* Header / Status Bar */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full animate-pulse", 
                    status === 'error' ? "bg-red-500" : 
                    status === 'connecting' ? "bg-yellow-500" : "bg-green-500"
                )} />
                <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                    {status === 'connecting' ? 'Connecting...' : 
                     status === 'listening' ? 'Listening' : 
                     status === 'speaking' ? 'AI Speaking' : 
                     status === 'error' ? 'Error' : 'Ready'}
                </span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white" onClick={endSession}>
                <X className="h-5 w-5" />
            </Button>
        </div>

        {/* Visualizer Area */}
        <div className="h-64 flex flex-col items-center justify-center relative">
            
            {status === 'connecting' && (
                <Loader2 className="h-10 w-10 text-[#e78a53] animate-spin" />
            )}

            {status === 'error' && (
                <div className="text-center px-6">
                    <Activity className="h-10 w-10 text-red-500 mx-auto mb-3" />
                    <p className="text-red-400 mb-2 font-medium">Microphone Access Denied</p>
                    <p className="text-xs text-zinc-500">Please allow microphone access in your browser settings.</p>
                </div>
            )}

            {(status === 'listening' || status === 'speaking') && (
                <div className="flex items-center justify-center gap-2 h-20">
                    {/* Simulated Waveform */}
                    {[...Array(5)].map((_, i) => (
                        <div 
                            key={i}
                            className="w-3 bg-[#e78a53] rounded-full transition-all duration-150 ease-in-out"
                            style={{ 
                                height: isMuted && status === 'listening' ? '8px' : `${volume[i]}px`,
                                opacity: status === 'speaking' ? 1 : 0.6
                            }}
                        />
                    ))}
                </div>
            )}

            {/* AI Avatar / Status Text */}
            {status !== 'error' && (
                <div className="mt-8 text-center">
                    <p className="text-xl font-semibold text-white tracking-tight">
                        {status === 'speaking' ? "Speaking..." : status === 'listening' ? "I'm listening..." : "..."}
                    </p>
                    <p className="text-sm text-zinc-500 mt-1">Campus Map AI Assistant</p>
                </div>
            )}
        </div>

        {/* Controls Footer */}
        <div className="p-6 bg-zinc-900/50 flex justify-center items-center gap-6 border-t border-zinc-800/50">
            
            <Button 
                variant="outline" 
                size="icon" 
                className={cn(
                    "h-14 w-14 rounded-full border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-all",
                    isMuted && "bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20"
                )}
                onClick={toggleMute}
                disabled={status === 'connecting' || status === 'error'}
            >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            {/* End Call Button */}
            <Button 
                variant="destructive" 
                size="icon" 
                className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20"
                onClick={endSession}
            >
                {/* Rotate PhoneCall to look like "Hang Up" */}
                <PhoneCall className="h-6 w-6 rotate-[135deg]" />
            </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}