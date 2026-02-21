import { X, Search, Send, SendHorizonal, SendHorizonalIcon, Loader2 } from "lucide-react";
import Avatar from "../common/Avatar";
import { useEffect, useRef, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { forwardMessage } from "../../api/chatApi";

export default function ChatsModal({ onClose }) {
    const { chats, currentUser, selectedMessages, setSelectionMode, setMessages, userIsOnline, UserExistInChat } = useChat()
    const [selectedChats, setSelectedChats] = useState([]);
    const [search, setSearch] = useState("");
    const [show, setShow] = useState(false); // controls animation
    const [loading, setLoading] = useState(false);
    const menuRef = useRef(null);


    const handleSend = async () => {
        setLoading(true)
        const response = await forwardMessage({
            target_chat_ids: selectedChats, message_ids: selectedMessages,
            is_delivered: userIsOnline ? 1 : 0,
            is_seen: UserExistInChat?.id ? 1 : 0,
        })

        setMessages((prev) => [...prev, ...response.messages])
        setLoading(false)
        handleClose();
        setSelectionMode(false)
    };
    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 250); // wait animation before unmount
    };


    const toggleSelect = (id) => {
        setSelectedChats((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    const filteredChats = chats.filter((chat) =>
        chat.users.find(user => user.id !== currentUser.id && user.name?.toLowerCase().includes(search.toLowerCase()) || user.phone_number?.toLowerCase().includes(search.toLowerCase()))
    );
    // Close menu when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                handleClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [handleClose]);

    useEffect(() => {
        setTimeout(() => setShow(true), 10); // trigger animation after mount
    }, []);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300
      ${show ? "bg-black/60 backdrop-blur-sm opacity-100" : "opacity-0"}`}
        >
            {/* Modal */}
            <div
                ref={menuRef}
                className={`w-full max-w-xl bg-[#111b21] rounded-2xl shadow-2xl overflow-hidden
        transform transition-all duration-300 ease-out
        ${show ? "translate-y-0 scale-100 opacity-100" : "translate-y-10 scale-95 opacity-0"}`}
            >
                {/* Header */}
                <div className="flex items-center gap-4 px-5 py-4 border-b border-[#2a3942]">
                    <button onClick={handleClose} className="text-gray-300 hover:text-white  cursor-pointer transition">
                        <X />
                    </button>
                    <h2 className="text-lg font-semibold">Forward message to</h2>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-[#2a3942]">
                    <div className="flex items-center gap-3 px-4 py-2 focus-within:border-[#25d366] border-[#2a3942] rounded-full border-2 bg-[#0b141a]">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search name or number"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent outline-none flex-1 text-sm placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="px-5 pt-3 pb-2 text-gray-400 text-sm">Recent chats</div>

                <div className="max-h-[400px] overflow-y-auto px-2 pb-3 space-y-1">
                    {filteredChats.map((chat) => {
                        const isSelected = selectedChats.includes(chat.id);

                        return (
                            <div
                                key={chat.id}
                                onClick={() => toggleSelect(chat.id)}
                                className="flex items-center text-left gap-3 px-3 py-2 rounded-lg hover:bg-[#202c33] cursor-pointer transition"
                            >
                                {/* Checkbox */}
                                <div className={`w-5 h-5 rounded border-2 ${isSelected ? 'bg-[#00a884] border-[#00a884]' : 'border-gray-400'} flex items-center justify-center transition`}>
                                    {isSelected && (
                                        <div className="w-full h-full flex items-center justify-center rounded bg-[#00a884]">
                                            <svg
                                                className="w-3 h-3 text-black"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <Avatar src={chat.avatar} />

                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-white">
                                        {chat.users.find(user => user.id !== currentUser.id).name}
                                    </span>
                                    {chat.users.find(user => user.id !== currentUser.id).phone_number && (
                                        <span className="text-xs text-gray-400 truncate max-w-xs">
                                            {chat.users.find(user => user.id !== currentUser.id).phone_number}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {selectedChats.length > 0 && (
                    <div className="p-4 border-t border-[#2a3942] flex justify-end">
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="bg-[#25d366] hover:bg-[#20bd5c] hover:scale-105 text-black font-semibold px-6 py-2 flex items-center gap-2 rounded-full transition cursor-pointer "
                        >
                            {loading ? <Loader2 size={24} className="animate-spin" /> : <><SendHorizonalIcon size={24} fill="#25d366" stroke="black" strokeWidth="2" />{selectedChats.length}</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
