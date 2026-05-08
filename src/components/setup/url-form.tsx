"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ingestVideos, type IngestResult } from "@/app/actions/ingest";

export function UrlForm() {
  const [urls, setUrls] = useState("");
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<IngestResult[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const urlList = urls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    if (urlList.length === 0) return;

    startTransition(async () => {
      const res = await ingestVideos(urlList);
      setResults(res);
    });
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">Add YouTube Sources</CardTitle>
          <CardDescription>
            Paste YouTube URLs below (one per line). Transcripts will be
            fetched, chunked, and embedded for semantic search.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="urls">YouTube URLs</Label>
              <Textarea
                id="urls"
                placeholder={`https://www.youtube.com/watch?v=dQw4w9WgXcQ\nhttps://youtu.be/another-video-id`}
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                rows={6}
                className="resize-none font-mono text-sm"
                disabled={isPending}
              />
            </div>
            <Button
              type="submit"
              disabled={isPending || !urls.trim()}
              className="w-full"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  Processing transcripts...
                </span>
              ) : (
                "Ingest Videos"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Ingestion Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border/40 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm text-muted-foreground">
                      {r.videoId}
                    </p>
                    <p className="mt-1 text-sm">{r.message}</p>
                  </div>
                  <Badge
                    variant={
                      r.status === "success"
                        ? "default"
                        : r.status === "skipped"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {r.status === "success"
                      ? `${r.chunksCreated} chunks`
                      : r.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
