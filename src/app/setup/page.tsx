import { UrlForm } from "@/components/setup/url-form";

export default function SetupPage() {
  return (
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Source Management</h1>
        <p className="mt-2 text-muted-foreground">
          Add YouTube videos to your knowledge base. Transcripts are automatically
          extracted, chunked, and embedded for semantic search.
        </p>
      </div>
      <UrlForm />
    </div>
  );
}
