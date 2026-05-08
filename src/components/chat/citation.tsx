"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CirclePlay, Clock, ChartBar } from "lucide-react";

export interface CitationSource {
  content: string;
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  startTime: number | null;
  endTime: number | null;
  similarity: number;
}

function formatTime(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getYtUrl(videoUrl: string, startTime: number | null) {
  if (startTime === null) return videoUrl;
  return `${videoUrl}&t=${startTime}`;
}

export function InlineCitation({ sources }: { sources: CitationSource[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2 px-1">
        <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Reference Sources</p>
      </div>
      <div className="grid gap-2.5">
        {sources.map((source, idx) => (
          <a 
            key={idx} 
            href={getYtUrl(source.videoUrl, source.startTime)} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group block outline-none focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
          >
            <Card className="border-border/40 bg-muted/20 backdrop-blur-sm transition-all duration-300 group-hover:border-primary/30 group-hover:bg-muted/40 group-hover:shadow-md group-hover:shadow-primary/5">
              <CardContent className="flex items-start gap-4 p-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border/50 text-xs font-bold text-foreground shadow-sm transition-colors group-hover:border-primary/40 group-hover:text-primary">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-xs font-bold text-foreground/90 group-hover:text-primary transition-colors tracking-tight">
                      {source.videoTitle || source.videoId}
                    </span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <Badge variant="outline" className="h-5 shrink-0 text-[10px] font-bold bg-background/50 border-border/40 px-1.5 gap-1">
                        <Clock className="w-2.5 h-2.5 opacity-60" />
                        {formatTime(source.startTime)}
                      </Badge>
                      <Badge variant="secondary" className="h-5 shrink-0 text-[10px] font-bold px-1.5 gap-1">
                        <ChartBar className="w-2.5 h-2.5 opacity-60" />
                        {Math.round(source.similarity * 100)}%
                      </Badge>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground/80 leading-relaxed font-medium">
                    &ldquo;{source.content}&rdquo;
                  </p>
                </div>
                <div className="shrink-0 self-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  <CirclePlay className="w-5 h-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
