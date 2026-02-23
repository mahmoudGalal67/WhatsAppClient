import { ChatProvider } from "../context/ChatContext";
import Sidebar from "../components/layout/Sidebar";
import ChatArea from "../components/layout/ChatArea";
import { useState } from "react";

export default function ChatPage() {
  const [isMyProfile, setIsMyProfile] = useState(false);

  return (
    <ChatProvider>
      <div className="h-[100dvh] w-screen bg-[#0b141a] text-white flex overflow-hidden">
        {/* <InfoPanel /> */}
        <Sidebar isMyProfile={isMyProfile} setIsMyProfile={setIsMyProfile} />
        <ChatArea />
      </div>
    </ChatProvider>
  );
}
