import { useEffect, useRef } from "react";
import Message from "./message/Message";
import { useMessages } from "../../context/MessageContext";

export default function MessageList({ selectedReplyMessage, setSelectedReplyMessage }) {
  const { messages } = useMessages();
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
