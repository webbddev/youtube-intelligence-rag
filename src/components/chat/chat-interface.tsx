"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { InlineCitation, type CitationSource } from "./citation";
import { Send, Bot, User, Sparkles, Play, ExternalLink } from "lucide-react";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status } = useChat();

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-slot="scroll-area-viewport"]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, status]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <div className="flex h-full flex-col bg-mesh-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none" />
      <ScrollArea ref={scrollRef} className="flex-1 min-h-0 px-4 relative z-10">
        <div className="mx-auto max-w-3xl space-y-8 py-10">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative mb-6">
                  <div className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl animate-pulse" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-2xl shadow-primary/40">
                    <Sparkles className="h-10 w-10 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold tracking-tight">How can I help today?</h3>
                <p className="mt-4 max-w-md text-base text-muted-foreground leading-relaxed">
                  I can search through your YouTube transcripts to answer questions, find specific moments, and summarize topics with accurate citations.
                </p>
                <div className="mt-10 grid grid-cols-2 gap-3 w-full max-w-sm">
                  {["Summarize the main points", "Find mentions of AI"].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage({ text: suggestion })}
                      className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-sm font-medium transition-all hover:bg-muted hover:border-primary/30 text-left"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-4 animate-in fade-in duration-500">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Bot className="h-5 w-5 text-primary animate-pulse" />
                </div>
                <div className="space-y-3 flex-1 pt-1">
                  <Skeleton className="h-4 w-[90%] rounded-full" />
                  <Skeleton className="h-4 w-[60%] rounded-full" />
                  <Skeleton className="h-4 w-[75%] rounded-full" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

      <div className="z-20 border-t border-border/40 bg-background/60 backdrop-blur-2xl px-4 py-6">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <div className="relative flex w-full gap-2 bg-muted/30 border border-border/40 rounded-2xl p-2 transition-all group-focus-within:border-primary/40 group-focus-within:bg-background shadow-sm">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your transcripts..."
              className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted-foreground/60"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()} 
              className="rounded-xl h-10 w-10 p-0 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
        <p className="mt-3 text-center text-[10px] text-muted-foreground/60 uppercase tracking-widest font-medium">
          Powered by Gemini & Neon Vector Search
        </p>
      </div>
    </div>
  );
}

function ParsedText({ text, sources }: { text: string; sources: CitationSource[] }) {
  // Regex to match [Source: videoId @ MM:SS - MM:SS]
  const citationRegex = /\[Source: ([a-zA-Z0-9_-]+) @ (\d+:\d+) - (\d+:\d+)\]/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = citationRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const [fullMatch, videoId, startStr, endStr] = match;
    
    // Find the source in toolSources to get the actual URL
    const source = sources.find(s => s.videoId === videoId);
    
    if (source) {
      // Convert MM:SS to seconds for the URL
      const [m, s] = startStr.split(':').map(Number);
      const startTime = m * 60 + s;
      const url = `${source.videoUrl}&t=${startTime}`;

      parts.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20 group/cite no-underline"
          title={`View on YouTube at ${startStr}`}
        >
          <Play className="w-3 h-3" />
          <span className="text-[10px] font-bold max-w-[120px] truncate overflow-hidden">
            {source.videoTitle || "Source"}
          </span>
          <ExternalLink className="w-2.5 h-2.5 opacity-50 group-hover/cite:opacity-100 transition-opacity" />
        </a>
      );
    } else {
      parts.push(fullMatch);
    }

    lastIndex = citationRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts.length > 0 ? parts : text}</>;
}

function MessageBubble({ message }: { message: any }) {
  const isUser = message.role === "user";
  const toolSources: CitationSource[] = [];

  // Extract citation sources from tool results
  for (const part of message.parts || []) {
    if (part.type?.startsWith("tool-") && part.state === "output-available") {
      const output = part.output as CitationSource[] | undefined;
      if (Array.isArray(output)) {
        toolSources.push(...output);
      }
    }
  }

  return (
    <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : "animate-in fade-in duration-700"}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
        isUser 
          ? "bg-background border-border/50 text-foreground" 
          : "bg-primary border-primary/20 text-primary-foreground shadow-primary/20"
      }`}>
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>
      
      <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-5 py-4 shadow-sm border ${
          isUser 
            ? "bg-muted/50 border-border/30 text-foreground rounded-tr-none" 
            : "bg-card border-border/40 text-card-foreground rounded-tl-none shadow-md"
        }`}>
          {(message.parts || []).map((part: any, index: number) => {
            if (part.type === "text" && part.text) {
              return (
                <div key={index} className="whitespace-pre-wrap text-[15px] leading-relaxed font-medium tracking-tight">
                  <ParsedText text={part.text} sources={toolSources} />
                </div>
              );
            }
            if (part.type?.startsWith("tool-") && part.state === "input-available") {
              return (
                <div key={index} className="flex items-center gap-2.5 py-1 text-xs font-semibold text-primary">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                  Searching knowledge base...
                </div>
              );
            }
            return null;
          })}
        </div>
        
        {!isUser && toolSources.length > 0 && (
          <div className="w-full mt-2 animate-in fade-in slide-in-from-top-2 duration-500">
            <InlineCitation sources={toolSources} />
          </div>
        )}
      </div>
    </div>
  );
}
