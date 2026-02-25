import {
  BellOffIcon,
  Forward,
  LogOutIcon,
  SearchIcon,
  Send,
  Trash2,
  X,
  MessageSquareTextIcon,
  UserIcon,
} from "lucide-react";

import ChatList from "../chat/ChatList";
import Avatar from "../common/Avatar";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import NewChatModal from "../chat/NewChatModal";
import ChatOptions from "../chat/ChatOptions";
import DeletePopup from "../chat/DeletePopup";
import { deleteChats } from "../../api/chatApi";
import MyProfile from "../MyProfile";

import { useChatList } from "../../context/ChatListContext";
import { useActiveChat } from "../../context/ActiveChatContext";
import { useAuth } from "../../context/AuthContext";
import { useChatUI } from "../../context/ChatUIContext";
import echo from "../../lib/bootstrap";

export default function Sidebar({ setIsMyProfile, isMyProfile }) {
  const { chats, setChats } = useChatList();
  const { setActiveChat, showChat } = useActiveChat();
  const { selectionChatMode, clearChatSelection, selectedChats } = useChatUI();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openNewChat, setOpenNewChat] = useState(false);
  const [chatOption, setChatOption] = useState("");

  const menuRef = useRef(null);

  /* ================= MEMO FILTER ================= */

  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;

    return chats.filter((chat) =>
      chat.users
        .find((u) => u.id !== user?.id)
        ?.name?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, chats, user?.id]);

  /* ================= SEARCH ================= */

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  /* ================= OUTSIDE CLICK ================= */

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= LOGOUT ================= */

  const handleLogout = useCallback(() => {
    try {
      echo.disconnect(); // 🔥 IMPORTANT
    } catch { }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }, []);

  /* ================= NEW CHAT ================= */

  const handleNewChat = useCallback(() => {
    setOpenNewChat(true);
    setOpen(false);
  }, []);

  /* ================= DELETE ================= */

  const handleDelete = useCallback(() => {
    deleteChats(selectedChats);
    setChats((prev) => prev.filter((c) => !selectedChats.includes(c.id)));
    setActiveChat(null);
    clearChatSelection();
    setConfirmDelete(false);
  }, [selectedChats, setChats, setActiveChat, clearChatSelection]);

  /* ================= ESC CLEAR ================= */

  useEffect(() => {
    if (!selectionChatMode) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") { clearChatSelection(); setChatOption(""); };
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectionChatMode, clearChatSelection]);

  /* ================= CHAT OPTION ================= */

  const handleChatOption = useCallback(() => {
    if (!selectedChats.length) return;

    if (selectionChatMode === "deleteChats") {
      setConfirmDelete(true);
    } else if (selectionChatMode === "sendMessages") {
      setChatOption("shareMessage");
    } else if (selectionChatMode === "forward") {
      setChatOption("forward");
    }
  }, [selectionChatMode, selectedChats.length]);

  /* ================= PROFILE ================= */

  if (isMyProfile) {
    return (
      <MyProfile
        myProfile={user}
        setIsMyProfile={setIsMyProfile}
      />
    );
  }

  /* ================= UI ================= */

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
      {openNewChat && (
        <NewChatModal onClose={() => setOpenNewChat(false)} />
      )}

      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between">
        <div
          className="flex items-center gap-8 cursor-pointer"
          onClick={() => setIsMyProfile(true)}
        >
          <Avatar src={user?.avatar} />
          <h1 className="text-2xl font-bold">WhatsApp</h1>
        </div>

        <div className="flex gap-4 text-gray-400 relative" ref={menuRef}>
          <span
            className="text-2xl font-bold cursor-pointer"
            onClick={() => setOpen((p) => !p)}
          >
            ⋮
          </span>

          {open && (
            <div className="absolute right-0 top-10 w-48 bg-[#233138] shadow-lg rounded-md text-sm z-50 rounded-b-lg px-2 py-4">
              <MenuItem text="New Chat" icon={<MessageSquareTextIcon size={16} />} onClick={handleNewChat} />
              <MenuItem text="Chat info" icon={<UserIcon size={16} />} />
              <MenuItem text="Mute Chats" icon={<BellOffIcon size={16} />} />
              <MenuItem text="Clear Chats" danger icon={<MessageSquareTextIcon size={16} />} />
              <MenuItem text="Logout" danger icon={<LogOutIcon size={16} />} onClick={handleLogout} />
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-2 relative">
        <SearchIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          className="w-full pl-8 placeholder:text-gray-400 bg-[#111b21] px-4 py-2 rounded-2xl text-sm outline-none"
          placeholder="Search or start a new chat"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <ChatList filteredChats={filteredChats} />

      {/* Selection bar */}
      {selectionChatMode && (
        <div className="h-14 bg-[#202c33] flex items-center justify-between px-4 border-t border-[#2a3942] absolute bottom-0 left-0 right-0">
          <div className="flex items-center gap-4">
            <button onClick={clearChatSelection} className="cursor-pointer">
              <X />
            </button>
            <span>{selectedChats.length} selected</span>
          </div>

          <button
            onClick={handleChatOption}
            className="transition cursor-pointer hover:-translate-y-1 hover:scale-110"
          >
            {selectionChatMode === "deleteChats" && <Trash2 color="red" size={25} />}
            {selectionChatMode === "sendMessages" && <Send color="green" size={25} />}
            {selectionChatMode === "forward" && <Forward color="blue" size={25} />}
          </button>
        </div>
      )}

      {chatOption && (
        <ChatOptions
          onClose={() => setChatOption("")}
          option={chatOption}
        />
      )}

      {confirmDelete && (
        <DeletePopup
          onClose={() => setConfirmDelete(false)}
          handleDelete={handleDelete}
        />
      )}
    </aside>
  );
}

function MenuItem({ text, danger, icon, onClick }) {
  return (
    <div
      className={`px-2 py-2 cursor-pointer hover:bg-[#111b21] flex items-center gap-1 rounded-lg ${danger ? "text-red-400" : "text-gray-200"
        }`}
      onClick={onClick}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </div>
  );
}