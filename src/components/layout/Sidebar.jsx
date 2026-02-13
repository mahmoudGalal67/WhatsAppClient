import { BellOffIcon, Forward, LogOutIcon, SearchIcon, Send, Trash2, X } from "lucide-react";
import ChatList from "../chat/ChatList";
import Avatar from "../common/Avatar";
import { useEffect, useRef, useState } from "react";
import { MessageSquareTextIcon, UserIcon } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import NewChatModal from "../chat/NewChatModal";
import ChatOptions from "../chat/ChatOptions";
import DeletePopup from "../chat/DeletePopup";

export default function Sidebar() {
  const { showChat, selectionChatMode, clearChatSelection, selectedChats, setConversations, setActiveChat } = useChat();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [openNewChat, setOpenNewChat] = useState(false);
  const [chatOption, setchatOption] = useState('');
  const menuRef = useRef(null);


  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };


  const handleNewChat = () => {
    setOpenNewChat(true);
    setOpen(false);
  };


  const handleDelete = () => {
    // deleteConversations(selectedChats)
    setConversations((prev) => prev.filter((conv) => !selectedChats.includes(conv.id)))
    setActiveChat(null)
    clearChatSelection()
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        clearChatSelection();
      }
    };

    if (selectionChatMode) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectionChatMode]);


  const handleChatOption = () => {
    if (selectionChatMode === 'deleteChats') {
      setConfirmDelete(true);
    }
    else if (selectionChatMode === 'sendMessages') {

    }
  }

  return (
    <aside
      className={`
    bg-[#202c33] border-r border-[#2a3942]
    flex flex-col
    w-full md:w-[420px]
    h-full

    absolute md:relative
    inset-y-0 left-0

    transition-transform duration-300 ease-in-out
    ${showChat ? "-translate-x-full md:translate-x-0" : "translate-x-0"}
  `}
    >
      {openNewChat && <NewChatModal onClose={() => setOpenNewChat(false)} />}
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Avatar />
          <h1 className="text-2xl font-bold">WhatsApp</h1>
        </div>
        <div className="flex gap-4 text-gray-400 relative" ref={menuRef}>
          <span className="text-2xl font-bold cursor-pointer" onClick={() => setOpen(!open)}>⋮</span>
          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-10 w-48 bg-[#233138] shadow-lg rounded-md py-1 text-sm z-50 rounded-b-lg px-2 py-4">
              <MenuItem text="New Chat" icon={<MessageSquareTextIcon width={16} height={16} />} onClick={handleNewChat} />
              <MenuItem text="Chat info" icon={<UserIcon width={16} height={16} />} />
              <MenuItem text="Mute Chats" icon={<BellOffIcon width={16} height={16} />} />
              <MenuItem text="Clear Chats" danger icon={<MessageSquareTextIcon width={16} height={16} />} />
              <MenuItem text="Logout" danger icon={<LogOutIcon width={16} height={16} />} onClick={handleLogout} />
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-2 relative">
        <SearchIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 " />
        <input
          className="w-full pl-8
          placeholder:text-gray-400
           bg-[#111b21] px-4 py-2 rounded-2xl text-sm outline-none"
          placeholder="Search or start a new chat"
        />
      </div>

      <ChatList />
      {
        selectionChatMode && (
          <div className="h-14 bg-[#202c33] flex items-center justify-between px-4 border-b border-[#2a3942] absolute bottom-0 left-0 right-0 border-t ">
            <div className="flex items-center gap-4">
              <button onClick={clearChatSelection} className="cursor-pointer">
                <X />
              </button>
              <span>{selectedChats.length} selected</span>
            </div>

            <button
              onClick={handleChatOption}
              className="text-red-400 hover:text-red-600 transition cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:translate-x-1"
            >
              {selectionChatMode === 'deleteChats' && selectedChats.length != 0 && <Trash2 onClick={() => { setchatOption('deleteChats') }} color="red" size={25} />}
              {selectionChatMode === 'sendMessages' && selectedChats.length != 0 && <Send onClick={() => { setchatOption('sendMessages') }} color="green" size={25} />}
              {selectionChatMode === 'forward' && selectedChats.length != 0 && <Forward onClick={() => { setchatOption('forward') }} color="blue" size={25} />}
            </button>
          </div>
        )
      }
      {chatOption && <ChatOptions onClose={() => setchatOption('')} option={chatOption} />}
      {confirmDelete && <DeletePopup onClose={() => setConfirmDelete(false)} handleDelete={handleDelete} />}
    </aside>
  );
}

function MenuItem({ text, danger, icon, onClick }) {
  return (
    <div
      className={` px-2 py-2 cursor-pointer hover:bg-[#111b21] flex items-center gap-1 rounded-lg
      ${danger ? "text-red-400" : "text-gray-200"}`}
      onClick={onClick}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </div>
  );
}

