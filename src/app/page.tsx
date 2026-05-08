import { ChatInterface } from "@/components/chat/chat-interface";

export default function HomePage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      <ChatInterface />
    </div>
  );
}
