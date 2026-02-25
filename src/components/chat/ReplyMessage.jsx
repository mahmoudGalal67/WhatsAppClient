import { X } from "lucide-react";
import { useChatUI } from "../../context/ChatUIContext";

export default function ReplyMessage({ selectedReplyMessage }) {
    const { clearSelection } = useChatUI();
    return (
        <div className='absolute bottom-14 left-0  bg-[#202c33] w-full h-20 p-2 rounded-md pb-0 border-l-4 border-l-green-500'>
            <button className="absolute top-4 right-4 text-gray-400 cursor-pointer hover:text-white" onClick={clearSelection}>
                <X size={20} />
            </button>
            <div className="bg-[#111b21] w-full h-full rounded-md ">
                <h1 className="text-sm text-left ml-5 pt-2 text-green-500">You</h1>
                <p className="text-sm text-left ml-5 pt-2 text-gray-400">{selectedReplyMessage.body}</p>
            </div>
        </div>
    );
}