"use client";

import React, { useEffect, useRef } from 'react';
import { Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";

// Make sure to install these:
// npm install react-markdown remark-gfm

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp?: Date;
}

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 text-slate-400 p-8">
        <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100 mb-2">
          <Bot className="h-8 w-8 text-[#5C5FFF]/50" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-600">Event Concierge</p>
          <p className="text-sm">Ask about the agenda, speakers, or venue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
      {messages.map((message, index) => (
        <div 
          key={message.id || index} 
          className={cn(
            "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
            message.role === 'assistant' ? 'justify-start' : 'justify-end'
          )}
        >
          <div 
            className={cn(
              "flex max-w-[85%] md:max-w-[75%] gap-3",
              message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1",
              message.role === 'assistant' 
                ? "bg-white text-[#FF647C] border border-slate-100" 
                : "bg-[#5C5FFF] text-white"
            )}>
              {message.role === 'assistant' 
                ? <Sparkles size={16} /> 
                : <User size={16} />
              }
            </div>

            {/* Message Bubble */}
            <div 
              className={cn(
                "p-3.5 px-5 rounded-2xl shadow-sm text-sm relative group",
                message.role === 'assistant' 
                  ? "bg-white text-slate-700 border border-slate-100 rounded-tl-none" 
                  : "bg-[#5C5FFF] text-white rounded-tr-none"
              )}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:m-0 prose-ul:m-0 prose-li:m-0">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Customizing markdown elements to fit the chat bubble
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-outside ml-4 mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-outside ml-4 mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-sm">{children}</li>,
                      strong: ({ children }) => <span className="font-semibold text-slate-900">{children}</span>,
                      a: ({ children, href }) => (
                        <a href={href} className="text-[#5C5FFF] hover:underline font-medium" target="_blank" rel="noreferrer">
                          {children}
                        </a>
                      ),
                      code: ({ children }) => <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono text-slate-800">{children}</code>
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
              )}

              {/* Timestamp (Optional) */}
              {message.timestamp && (
                <span className={cn(
                  "text-[10px] absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
                  message.role === 'assistant' ? "left-0 text-slate-400" : "right-0 text-slate-400"
                )}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex w-full justify-start animate-in fade-in duration-300">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-white text-[#FF647C] border border-slate-100 flex items-center justify-center shrink-0 shadow-sm mt-1">
              <Sparkles size={16} />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1 items-center h-[46px]">
              <div className="w-2 h-2 bg-[#FF647C]/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-[#FF647C]/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-[#FF647C]/60 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;