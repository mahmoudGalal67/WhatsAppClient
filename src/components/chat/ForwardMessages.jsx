import { Forward, X } from "lucide-react";
import ChatsModal from "./ChatsModal";
import { useState } from "react";
import { useChatUI } from "../../context/ChatUIContext";

export default function ForwardMessages() {
    const { selectedMessages, clearSelection } = useChatUI();
    const [showForwaardedContacts, setShowForwaardedContacts] = useState(false);

    return (
        <div className="h-14 bg-[#202c33] flex items-center justify-between px-4 border-b border-[#2a3942] absolute bottom-0 left-0 right-0 z-10">
            <div className="flex items-center gap-4">
                <button onClick={clearSelection} className="cursor-pointer">
                    <X />
                </button>
                <span>{selectedMessages.length} selected</span>
            </div>

            <button
                className="text-red-400 hover:text-red-600 transition cursor-pointer"
                onClick={() => setShowForwaardedContacts(true)}
            >
                {selectedMessages.length !== 0 && <Forward size={25} color="green" />}
            </button>

            {showForwaardedContacts && (
                <ChatsModal onClose={() => setShowForwaardedContacts(false)} />
            )}
        </div>
    );
}   
