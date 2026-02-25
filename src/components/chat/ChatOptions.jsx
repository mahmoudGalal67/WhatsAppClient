import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { deleteChats, shareMessage } from "../../api/chatApi";
import { useChatUI } from "../../context/ChatUIContext";

export default function ChatOptions({ onClose, option }) {
    const { selectedChats, setSelectionChatMode, setSelectedChats } = useChatUI();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const menuRef = useRef(null);


    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await shareMessage({ body: message, chat_ids: selectedChats, type: 'text' });
            setSelectionChatMode('');
            setSelectedChats([]);
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to create contact");
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteChats = async () => {
        try {
            await deleteChats();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to delete chats");
        }
    };
    return (
        <div ref={menuRef} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            {option === "shareMessage" && (
                <div className="bg-[#202c33] w-[90%] max-w-md rounded-2xl shadow-xl p-6 relative animate-fadeIn">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 ">
                        <h2 className="text-lg font-semibold text-white">Share Message</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
                            <X />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">


                        {/* Name */}
                        <div>
                            <label className="text-sm text-gray-300 block mb-2 text-left">Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#00a884]"
                                placeholder="Enter message"
                            />
                        </div>


                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#00a884] hover:bg-[#019874] transition text-white py-2.5 rounded-lg font-medium cursor-pointer"
                        >
                            {loading ? "Sending..." : "Send"}
                        </button>
                    </form>
                </div>
            )}
            {option === "deleteChats" && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" >
                    <div className="bg-[#202c33] p-6 rounded-lg w-[90%] max-w-md flex flex-col gap-12" ref={menuRef}>
                        <h2 className="text-lg mb-4 text-left">
                            Delete Chats?
                        </h2>
                        <div className="flex justify-end gap-4">
                            <button onClick={onClose} className="text-green-400 cursor-pointer hover:text-green-500 transition-colors hover:bg-green-500/10 px-4 py-2 rounded-3xl">
                                Cancel
                            </button>
                            <button onClick={handleDeleteChats} className="text-black font-semibold bg-green-500 px-8 py-2 rounded-3xl cursor-pointer hover:bg-green-600 transition-colors">
                                Delete for me
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
