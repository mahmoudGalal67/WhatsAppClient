import { useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import Message from "./Message";

export default function MessageList({ selectedReplyMessage, setSelectedReplyMessage }) {
  const { messages } = useChat();
  const bottomRef = useRef(null);
  // 🔥 Auto scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-2">
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} selectedReplyMessage={selectedReplyMessage} setSelectedReplyMessage={setSelectedReplyMessage} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
