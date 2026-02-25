import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useChatList } from "../../context/ChatListContext";

export default function NewContactModal({ onClose }) {
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const menuRef = useRef(null);

    const { setConversations } = useChatList()

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
            const formData = new FormData();
            formData.append("name", name);
            formData.append("phoneNumber", phoneNumber);
            if (image) formData.append("imageUrl", image);

            const response = await addConversations({ phoneNumber, name, imageUrl: 'fdsfds' })
            // const response = addConversations(formData)
            setConversations((prev) => [{ ...response, createdAt: new Date() }, ...prev])
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to create contact");
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
                    <div className="flex flex-col items-center">
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
                    </div>

                    {/* Name */}
                    <div>
                        <label className="text-sm text-gray-300 block mb-1">Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#00a884]"
                            placeholder="Enter contact name"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-sm text-gray-300 block mb-1">Phone Number</label>
                        <input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#00a884]"
                            placeholder="e.g. 201234567890"
                        />
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
