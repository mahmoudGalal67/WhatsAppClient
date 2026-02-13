import { ChatProvider } from "../context/ChatContext";
import Sidebar from "../components/layout/Sidebar";
import ChatArea from "../components/layout/ChatArea";
import InfoPanel from "../components/layout/InfoPanel";

export default function ChatPage() {
  return (
    <ChatProvider>
      <div className="h-screen w-screen bg-[#0b141a] text-white flex overflow-hidden">
        {/* <InfoPanel /> */}
        <Sidebar />
        <ChatArea />
      </div>
    </ChatProvider>
  );
}
