import { Bell, Edit, Lock, MessageSquareTextIcon, Pencil, Shield, Star, X } from "lucide-react";
import { useState } from "react";
import { updateProfile } from "../api/chatApi";
import { useChatList } from "../context/ChatListContext";
import { useActiveChat } from "../context/ActiveChatContext";
import { useChatUI } from "../context/ChatUIContext";

export default function ProfilePanel({ otherUser }) {
  const { activeChat, setActiveChat } = useActiveChat();
  const { openEditProfile, goBackPanel, profileOpen } = useChatUI();
  const { setChats } = useChatList();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("id", otherUser?.id);
    const response = await updateProfile(formData);
    setActiveChat((prev) => {
      return {
        ...prev,
        users: prev.users.map((user) => user.id === otherUser.id ? { ...user, avatar: response?.user?.avatar } : user)
      }
    });
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== activeChat.id) return chat;

        return {
          ...chat,
          users: chat.users.map((user) =>
            user.id === otherUser.id
              ? { ...user, avatar: response?.user?.avatar }
              : user
          ),
        };
      })
    );
  };

  return (
    <div
      className={`absolute right-0 top-0 h-full xl:w-1/3 w-full bg-[#111b21]
  transition-transform duration-300
  ${profileOpen ? "translate-x-0 " : "translate-x-full "}
  z-[20]`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a3942] sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={goBackPanel} className="hover:bg-[#2a3942] p-2 rounded-full cursor-pointer">
            <X />
          </button>
          <h2 className="text-lg font-medium">Contact info</h2>
        </div>

        <button onClick={openEditProfile} className="hover:bg-[#2a3942] p-2 rounded-full cursor-pointer">
          <Pencil size={18} />
        </button>
      </div>

      {/* Profile Content */}
      <div className="flex flex-col items-center py-8 border-b border-[#2a3942] relative">
        <img
          className="w-36 h-36 rounded-full object-cover mb-4"
          // src={otherUser?.avatar ? `${import.meta.env.VITE_APP_URL}/storage/${otherUser?.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
          src={otherUser?.avatar ? `https://laravelwhatsappdeploy-production.up.railway.app/storage/${otherUser?.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
        />
        <h3 className="text-xl font-semibold">{otherUser?.name}</h3>
        <p className="text-gray-400 mt-1">{otherUser?.phone_number}</p>
        <input type="file" accept="image/*" className="hidden profile-avatar" onChange={handleImageChange} />
        <Edit className="cursor-pointer absolute bottom-[45%] right-[37%]" onClick={() => document.querySelector("input[type='file'].profile-avatar").click()} />
      </div>

      {/* Options */}
      <div className="p-4 space-y-4 text-sm">
        <PanelItem text="Starred messages" icon={<Star size={18} />} />
        <PanelItem text="Mute notifications" toggle icon={<Bell size={18} />} />
        <PanelItem text="Disappearing messages" sub="Off" icon={<MessageSquareTextIcon size={18} />} />
        <PanelItem text="Advanced chat privacy" sub="Off" icon={<Shield size={18} />} />
        <PanelItem text="Encryption" sub="Messages are end-to-end encrypted." icon={<Lock size={18} />} />
        <PanelItem text="Encryption" sub="Messages are end-to-end encrypted." icon={<Lock size={18} />} />
        <PanelItem text="Block contact" icon={<Lock size={18} className="text-red-400" />} danger />
        <PanelItem text="Delete chat" icon={<Lock size={18} className="text-red-400" />} danger />
      </div>
    </div>
  );
}

function PanelItem({ text, sub, toggle, onClick, icon, danger }) {

  const [checked, setChecked] = useState(false);

  return (
    <div onClick={onClick} className="flex justify-between items-center py-3 border-b border-[#1f2c33] cursor-pointer hover:bg-[#2a3942] px-4 py-2 rounded-lg">
      <div className="flex items-center gap-2">
        {icon && icon}
        <div className={`flex flex-col gap-1 w-fit ${danger ? "text-red-400" : "text-gray-200"}`}>
          <p className="w-fit">{text}</p>
          {sub && <p className={`text-xs text-gray-400 w-fit cursor-pointer ${danger ? "text-red-400" : "text-gray-200"}`}>{sub}</p>}
        </div>
      </div>
      {toggle && <button
        onClick={() => setChecked(!checked)}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300
        ${checked ? "bg-[#25D366]" : "bg-gray-600"}`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300
          ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>}
    </div>
  );
}
