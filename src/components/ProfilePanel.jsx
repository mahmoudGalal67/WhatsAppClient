import { ArrowLeft, Bell, Lock, MessageSquareTextIcon, Pencil, Shield, Star, X } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { useState } from "react";

export default function ProfilePanel() {
  const { openEditProfile, activeChat, goBackPanel, profileOpen } = useChat();

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
      <div className="flex flex-col items-center py-8 border-b border-[#2a3942]">
        <img
          src={activeChat?.avatar}
          className="w-36 h-36 rounded-full object-cover mb-4"
        />
        <h3 className="text-xl font-semibold">{activeChat?.contactName}</h3>
        <p className="text-gray-400 mt-1">{activeChat?.phoneNumber}</p>
      </div>

      {/* Options */}
      <div className="p-4 space-y-4 text-sm">
        <PanelItem text="Starred messages" icon={<Star size={18} />} />
        <PanelItem text="Mute notifications" toggle icon={<Bell size={18} />} />
        <PanelItem text="Disappearing messages" sub="Off" icon={<MessageSquareTextIcon size={18} />} />
        <PanelItem text="Advanced chat privacy" sub="Off" icon={<Shield size={18} />} />
        <PanelItem text="Encryption" sub="Messages are end-to-end encrypted." icon={<Lock size={18} />} />
        <PanelItem text="Encryption" sub="Messages are end-to-end encrypted." icon={<Lock size={18} />} />
        <PanelItem text="Block contact"  icon={<Lock size={18} className="text-red-400"/>} danger/>
        <PanelItem text="Delete chat"  icon={<Lock size={18} className="text-red-400"/>} danger/>
      </div>
    </div>
  );
}

function PanelItem({ text, sub, toggle, onClick ,icon ,danger}) {

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
      {toggle &&   <button
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
