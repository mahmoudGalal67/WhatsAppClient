import { useEffect, useRef, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { DateText } from "../../utils/utilis";
import {
  ChevronDown,
  CopyIcon,
  FlagIcon,
  ForwardIcon,
  MessageSquareTextIcon,
  StarIcon,
  TrashIcon,
} from "lucide-react";
import Delivered from "../icons/delevired";
import { formatWhatsAppDate } from "../../utils/formatWhatsAppDate";

export default function Message({ message }) {
  const [messageOption, setmessageOption] = useState(false);
  const [showArrow, setshowArrow] = useState(false);
  const menuRef = useRef(null);

  const {
    selectionMode,
    selectedMessages,
    toggleMessageSelection,
    setSelectionMode,
    clearSelection,
    user,
    activeChat
  } = useChat();
  const isSelected = selectedMessages.includes(message.id);


  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setmessageOption(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectionMode(false);
        clearSelection();
      }
    };

    if (selectionMode) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectionMode]);

  return (
    <div className={`flex  gap-4 flex-row-reverse ${selectionMode && selectionMode !== 'reply' ? "p-1 cursor-pointer hover:bg-[#202c33]/40 p-2 rounded-md" : ""} `}
      onClick={() => toggleMessageSelection(message.id)}
    >
      <div
        className={`max-w-[45%] w-fit ${message.type === "image" ? "px-1 py-1" : "px-2 py-1"} break-all text-left rounded-lg text-sm relative flex items-center gap-3 group relative flex items-end gap-2   ${message.user_id == user.id ? "ml-auto" : "mr-auto"
          } ${message.user_id == user.id ? "bg-[#005c4b]" : "bg-[#202c33]"
          }`}
        ref={menuRef}
        onMouseEnter={() => setshowArrow(true)}
        onMouseLeave={() => setshowArrow(false)}
      >
        {/* Dropdown */}
        {messageOption == true && (
          <div className={`absolute top-6 ${message.user_id == user.id ? "right-[70%]" : "left-[70%]"} w-48 h-fit bg-[#233138] shadow-lg rounded-md text-sm z-50 rounded-b-lg px-2 py-4`}>
            <MenuItem
              text="Reply"
              icon={<MessageSquareTextIcon width={16} height={16} />}
              onClick={() => {
                setmessageOption(false);
                setSelectionMode('reply');
                toggleMessageSelection(message.id);
              }}
            />
            <MenuItem
              text="Copy"
              icon={<CopyIcon width={16} height={16} />}
              onClick={() => {
                setmessageOption(false);
                setSelectionMode('copy');
                toggleMessageSelection(message.id);
              }}
            />
            <MenuItem
              text="Forward"
              icon={<ForwardIcon width={16} height={16} />}
              onClick={() => {
                setmessageOption(false);
                setSelectionMode('forward');
                toggleMessageSelection(message.id);
              }}
            />
            <MenuItem
              text="Star"
              icon={<StarIcon width={16} height={16} />}
              onClick={() => {
                setmessageOption(false);
                setSelectionMode('star');
                toggleMessageSelection(message.id);
              }}
            />
            <div className="w-full h-[1px] bg-gray-600 my-2" />
            <MenuItem
              text="Report"
              icon={<FlagIcon width={16} height={16} />}
              onClick={() => {
                setmessageOption(false);
                setSelectionMode('report');
                toggleMessageSelection(message.id);
              }}
            />

            <MenuItem
              onClick={() => {
                setmessageOption(false);
                setSelectionMode('delete');
                toggleMessageSelection(message.id);
              }}
              text="Delete chat"
              danger
              icon={<TrashIcon width={16} height={16} />}
            />
          </div>
        )}


        {message.type === "text" && <p>{message.body}</p>}
        {message.type === "image" && (
          <img
            src={
              message.pending
                ? message.file_path
                : `http://localhost:8000/storage/${message.file_path}`
            }
            className="rounded-lg max-w-xs"
          />
        )}

        <div className={`flex items-center gap-3 ${message.type === "image" ? "absolute bottom-2 right-4" : ""}`}>
          <div className="text-[10px] text-gray-300 text-right mt-2 flex gap-1 justify-end items-end w-14 ">
            {message.whatsapp_time || formatWhatsAppDate(message.created_at)}
          </div>
          <div className={`${message.is_seen ? 'text-blue-500' : 'text-white'}`}>
            {message.user_id != user.id ? "" : message.is_seen || message.is_delivered ? "✓✓" : "✓"}
          </div>
        </div>
        {/* Hover Arrow */}
        {showArrow && !selectionMode && (
          <button
            onClick={() => {
              setmessageOption((prev) => !prev);
            }}
            className="absolute right-1 top-3 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
          >
            <ChevronDown size={16} />
          </button>
        )}
      </div>
      {selectionMode && selectionMode !== 'reply' && (
        <label className="relative flex items-center cursor-pointer my-auto">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleMessageSelection(message.id)}
            className="peer sr-only"
          />
          <div
            className="w-5 h-5 rounded-md border-2 border-lightgray flex items-center justify-center
                  peer-checked:bg-[#00a884] peer-checked:border-[#00a884] transition-all"
          >
            <svg
              className={`w-3 h-3 text-black ${isSelected ? "opacity-100" : "opacity-0"} peer-checked:opacity-100`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </label>
      )}
    </div>
  );
}

function MenuItem({ text, danger, icon, onClick }) {
  return (
    <div
      className={` px-2 py-2 cursor-pointer hover:bg-[#111b21] flex items-center gap-1 rounded-lg
      ${danger ? "text-red-400 hover:bg-red-400/10" : "text-gray-200"}`}
      onClick={onClick}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </div>
  );
}
