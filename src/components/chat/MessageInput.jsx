import { useState, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import { ImageIcon, SendHorizonal } from "lucide-react";
import SelectionBar from "./SelectionBar";
import DeletePopup from "./DeletePopup";
import { deleteMessages } from "../../api/chatApi";

export default function MessageInput({ chatId }) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();
  const { handlelSendMessage, selectionMode, profileOpen, selectedMessages, clearSelection, setMessages, activeChat, sendTyping, handleSendMessage } = useChat();
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const submitText = (e) => {
    e.preventDefault();
    console.log(text);
    if (!text.trim()) return;
    handleSendMessage({
      chat_id: chatId,
      type: "text",
      body: text,
    });
    setText("");
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("type", "image");
    formData.append("body", file);
    handlelSendMessage(formData);
    setPreview(null);
    fileRef.current.value = "";
  };


  const handleDelete = () => {
    deleteMessages(selectedMessages);
    setMessages((prev) => prev.filter((message) => !selectedMessages.includes(message.id)));
    clearSelection();
  };

  return (
    <div
      className={`bg-[#202c33] p-3 relative ${profileOpen ? "w-[66.66%]" : "w-full"}`}
    >
      {/* Image Preview */}
      {preview && (
        <div className="mb-2 relative w-40">
          <img src={preview} className="rounded-lg" />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <form
        onSubmit={submitText}
        className="flex bg-[#111b21] items-center gap-2 rounded-2xl relative pl-12"
      >
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          className="text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer"
        >
          <ImageIcon size={22} />
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImage}
        />

        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            sendTyping();
          }}
          className="flex-1 px-4 py-2  outline-none text-sm"
          placeholder="Type a message"
        />

        {preview ? (
          <button
            type="button"
            onClick={sendImage}
            className="text-green-500 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            <SendHorizonal size={22} />
          </button>
        ) : (
          <button
            type="submit"
            className="text-green-500 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            <SendHorizonal size={22} />
          </button>
        )}
      </form>
      {selectionMode && (
        <SelectionBar />
      )}

    </div>
  );
}
