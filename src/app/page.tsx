import Image from "next/image";
import ChatView from "@/components/ChatView";

export default function Home() {
  return (
    <>
      <div className="max-w-4xl sm:container h-full">
        <ChatView />
      </div>
    </>
  );
}
