import { ArrowLeft, Check, CloudSync, Loader2, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { updateProfile } from "../api/chatApi";
import { useChatList } from "../context/ChatListContext";
import { useActiveChat } from "../context/ActiveChatContext";
import { useChatUI } from "../context/ChatUIContext";

export default function EditProfilePanel({ otherUser }) {
    const { activeChat, setActiveChat } = useActiveChat();
    const { setChats } = useChatList();
    const { editProfileOpen, goBackPanel } = useChatUI();
    const [name, setName] = useState(otherUser?.name || "");
    const [phone, setPhone] = useState(otherUser?.phone_number || "");
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (otherUser) {
            setName(otherUser?.name || "");
            setPhone(otherUser?.phone_number || "");
        }
    }, [otherUser])


    const handleUpdateprofile = async () => {
        try {
            setLoading(true);
            const response = await updateProfile({ id: otherUser?.id, name, phone_number: phone });
            setChats((prev) =>
                prev.map((chat) => {
                    if (chat.id !== activeChat.id) return chat;

                    return {
                        ...chat,
                        users: chat.users.map((user) =>
                            user.id === otherUser.id
                                ? { ...user, name: response?.user?.name, phone_number: response?.user?.phone_number }
                                : user
                        ),
                    };
                })
            );
            setActiveChat((prev) => {
                return {
                    ...prev,
                    users: prev.users.map((user) => user.id === otherUser.id ? { ...user, name: response?.user?.name, phone_number: response?.user?.phone_number } : user)
                }
            });
            goBackPanel();
        }
        catch (err) {
            console.log(err);
        }
        finally {
            setLoading(false);
        }

    }
    return (
        <div
            className={`absolute right-0 top-0 h-full xl:w-1/3 w-full bg-[#0b141a] h-screen flex flex-col
  transition duration-300
  ${editProfileOpen ? "translate-x-0 md:translate-x-0" : "translate-x-full md:translate-x-full"}
  z-[30]`}
        >

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2a3942]">
                <div className="flex items-center gap-2">
                    <button onClick={goBackPanel} className="hover:bg-[#2a3942] p-2 rounded-full cursor-pointer">
                        <ArrowLeft />
                    </button>
                    <h2 className="text-lg font-medium">Edit contact</h2>
                </div>


            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                    <User size={20} />
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm text-gray-400 text-left">Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-transparent border-b border-gray-600 focus:border-[#00a884] outline-none py-2"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Phone size={20} />
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm text-gray-400 text-left">Phone</label>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-transparent border-b border-gray-600 focus:border-[#00a884] outline-none py-2"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-8 mt-8">
                    <CloudSync size={18} className="text-gray-400" />
                    <div className="flex flex-col gap-1 justify-start text-left">
                        <p>Sync contact to phone</p>
                        <p className="text-xs text-gray-400">This contact will be synced to your phone</p>
                    </div>
                    <button
                        onClick={() => setChecked(!checked)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ml-auto
        ${checked ? "bg-[#25D366]" : "bg-gray-600"}`}
                    >
                        <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300
          ${checked ? "translate-x-5" : "translate-x-0"}`}
                        />
                    </button>
                </div>
            </div>
            <button className="bg-[#00a884] p-3 rounded-full mt-auto w-fit justify-self-center items-self-center mx-auto mb-12 cursor-pointer" onClick={handleUpdateprofile}>
                {loading ? <Loader2 size={26} className="animate-spin" /> : <Check size={26} />}
            </button>
        </div>
    );
}
