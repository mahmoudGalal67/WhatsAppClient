import { useChat } from "../../context/ChatContext";
import ChatItem from "./ChatItem";
import { ChatListSkeleton } from "./Loading";

export default function ChatList({ filteredChats }) {
  const { chats, loadingChats } = useChat();

  if (loadingChats) {
    return <ChatListSkeleton />;
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hover">
      {filteredChats?.map((chat) => (
        <ChatItem key={chat.id} chat={chat} />
      ))}
    </div>
  );
}
