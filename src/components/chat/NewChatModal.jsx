import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { addChat, getContacts } from "../../api/chatApi";
import Avatar from "../common/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useChatList } from "../../context/ChatListContext";
import ExcelUpload from "../ExcelUpload";

export default function NewChatModal({ onClose }) {
    const [name, setName] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const menuRef = useRef(null);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState([]);
    const { user } = useAuth()
    const { setChats } = useChatList()
    const [contacts, setContacts] = useState([])


    const filteredContacts = contacts?.filter((conv) => {
        if (search === "") return true;
        return conv.name.toLowerCase().includes(search.toLowerCase());
    });


    const toggleSelect = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((item) => item !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await getContacts();
                setContacts(response);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            }
        };
        fetchContacts();
    }, []);
    // Close menu when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await addChat({ user_one_id: user.id, other_user_ids: selected })
            setChats((prev) => [...prev, ...response])
            onClose();
        } catch (err) {
            console.error(err);
            alert(err.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={menuRef} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#202c33]  max-w-md w-[90%] rounded-2xl shadow-xl p-6 relative animate-fadeIn">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 ">
                    <h2 className="text-lg font-semibold text-white">New Chat</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
                        <X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Image Upload */}
                    {/* <div className="flex flex-col items-center">
                        <label className="relative cursor-pointer">
                            <div className="w-24 h-24 rounded-full bg-[#111b21] flex items-center justify-center overflow-hidden border border-[#2a3942]">
                                {preview ? (
                                    <img src={preview} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-400 text-sm">Upload</span>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div> */}
                    <ExcelUpload setContacts={setContacts} setChats={setChats} />
                    {/* Name */}
                    <span className="my-2 block">OR</span>
                    <hr />
                    <div className="mt-3">
                        <label className="text-sm text-gray-300 block mb-1">Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#00a884]"
                            placeholder="Enter contact name"
                        />
                    </div>

                    <div className="px-5 pt-3  text-gray-400 text-sm">Recent Contacts</div>

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


                    <div className="max-h-[400px] overflow-y-auto px-2 pb-3 space-y-1">
                        {filteredContacts.map((contact) => {
                            const isSelected = selected.includes(contact.id);

                            return (
                                <div
                                    key={contact.id}
                                    onClick={() => toggleSelect(contact.id)}
                                    className="flex items-center text-left gap-3 px-3 py-2 rounded-lg hover:bg-[#0b141a] cursor-pointer transition"
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

                                    <Avatar src={contact.avatar} />

                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium text-white">
                                            {contact.name}
                                        </span>
                                        {contact.phone_number && (
                                            <span className="text-xs text-gray-400 truncate max-w-xs">
                                                {contact.phone_number}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#00a884] hover:bg-[#019874] transition text-white py-2.5 rounded-lg font-medium cursor-pointer"
                    >
                        {loading ? "Creating..." : "Start Chat"}
                    </button>
                </form>
            </div>
        </div>
    );
}
