import { useState, useRef, useEffect } from "react";
import { useChat } from "../../context/ChatContext";
import { ImageIcon, SendHorizonal } from "lucide-react";
import SelectionBar from "./SelectionBar";
import DeletePopup from "./DeletePopup";
import { deleteMessages } from "../../api/chatApi";

import EmojiPicker from "emoji-picker-react";
import { Smile } from "lucide-react";
import ReplyMessage from "./ReplyMessage";

export default function MessageInput({ chatId, selectedReplyMessage, setSelectedReplyMessage }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();
  const { handlelSendMessage, selectionMode, profileOpen, selectedMessages, clearSelection, setMessages, activeChat, sendTyping, handleSendMessage, UserExistInChat, userIsOnline, user } = useChat();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  let actionComponent;

  {
    switch (selectionMode) {
      case 'reply':
        actionComponent = <ReplyMessage selectedReplyMessage={selectedReplyMessage} setSelectedReplyMessage={setSelectedReplyMessage} />;
        break;
      case 'delete':
        actionComponent = <SelectionBar />;
        break;
      case 'copy':
        actionComponent = <SelectionBar />;
        break;
      case 'forward':
        actionComponent = <SelectionBar />;
        break;
      case 'star':
        actionComponent = <SelectionBar />;
        break;
      case 'report':
        actionComponent = <SelectionBar />;
        break;
      default:
        actionComponent = null;
    }
  }


  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);


  const submitText = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    handleSendMessage({
      chat_id: chatId,
      type: "text",
      body: text,
      is_delivered: userIsOnline ? 1 : 0,
      is_seen: UserExistInChat?.id ? 1 : 0,
      reply_to: selectedReplyMessage?.id || null,
      reply_message: selectedReplyMessage,
    });
    setText("");
    setSelectedReplyMessage(null);
    clearSelection();
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const tempId = Date.now();
    const imageUrl = URL.createObjectURL(file);

    // 2️⃣ Send to backend
    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("type", "image");
    formData.append("file", file);
    formData.append("is_delivered", userIsOnline ? 1 : 0);
    formData.append("is_seen", UserExistInChat?.id ? 1 : 0);


    try {
      await handleSendMessage(formData);
    } catch (error) {
      console.log(error);
    }

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
      {/* {preview && (
        <div className="mb-2 relative w-40">
          <img src={preview} className="rounded-lg" />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )} */}

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
        <div ref={emojiRef} className="relative z-1 top-0 left-0">
          <button
            type="button"
            onClick={() => setShowEmoji((prev) => !prev)}
            className="text-gray-400 absolute left-1 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            <Smile size={22} />
          </button>

          {showEmoji && (
            <div className="absolute bottom-1/2 left-16 z-50 emoji-container">
              <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
            </div>
          )}
        </div>
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            sendTyping();
          }}
          className="flex-1 px-8 py-2  outline-none text-sm"
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
      {actionComponent}
    </div>
  );
}
