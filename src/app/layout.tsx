import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YTB Extractor — AI-Powered YouTube Transcript Search",
  description:
    "Ingest YouTube transcripts and ask questions with AI-powered semantic search and citations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased bg-background text-foreground font-sans`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <nav className="sticky top-0 z-50 h-16 border-b border-border/40 bg-background/60 backdrop-blur-xl">
            <div className="container mx-auto flex h-full items-center justify-between px-4">
              <Link
                href="/"
                className="flex items-center gap-2.5 font-bold tracking-tight text-lg"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
                  </svg>
                </span>
                <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">YTB Extractor</span>
              </Link>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/40">
                  <Link
                    href="/"
                    className="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-background/80"
                  >
                    Chat
                  </Link>
                  <Link
                    href="/setup"
                    className="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-background/80"
                  >
                    Setup
                  </Link>
                </div>
                <div className="h-4 w-px bg-border/40 mx-1" />
                <ThemeToggle />
              </div>
            </div>
          </nav>
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
