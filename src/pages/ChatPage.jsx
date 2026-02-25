import Sidebar from "../components/layout/Sidebar";
import ChatArea from "../components/layout/ChatArea";
import { useState } from "react";
import { AuthProvider } from "../context/AuthContext";
import { ChatListProvider } from "../context/ChatListContext";
import { ActiveChatProvider } from "../context/ActiveChatContext";
import { MessageProvider } from "../context/MessageContext";
import { ChatUIProvider } from "../context/ChatUIContext";

export default function ChatPage() {
  const [isMyProfile, setIsMyProfile] = useState(false);

  return (
    <AuthProvider>
      <ChatListProvider>
        <ActiveChatProvider>
          <MessageProvider>
            <ChatUIProvider>
              <div className="h-[100dvh] w-screen bg-[#0b141a] text-white flex overflow-hidden">
                {/* <InfoPanel /> */}
                <Sidebar isMyProfile={isMyProfile} setIsMyProfile={setIsMyProfile} />
                <ChatArea />
              </div>
            </ChatUIProvider>
          </MessageProvider>
        </ActiveChatProvider>
      </ChatListProvider>
    </AuthProvider>
  );
}
