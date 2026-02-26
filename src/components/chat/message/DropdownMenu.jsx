import {
    CopyIcon,
    FlagIcon,
    ForwardIcon,
    MessageSquareTextIcon,
    StarIcon,
    TrashIcon,
} from "lucide-react";
import { memo } from "react";

const DropdownMenu = memo(function DropdownMenu({
    isMine,
    message,
    setMessageOption,
    setSelectionMode,
    toggleMessageSelection,
    setSelectedReplyMessage,
}) {
    const handleAction = (mode) => {
        setMessageOption(false);
        setSelectionMode(mode);
        toggleMessageSelection(message.id);
    };

    return (
        <div
            className={`absolute top-6 ${isMine ? "right-[70%]" : "left-[70%]"
                } w-48 bg-[#233138] shadow-lg rounded-md text-sm z-50 px-2 py-4`}
        >
            <MenuItem
                text="Reply"
                icon={<MessageSquareTextIcon size={16} />}
                onClick={() => {
                    setMessageOption(false);
                    setSelectionMode("reply");
                    setSelectedReplyMessage(message);
                    toggleMessageSelection(message.id);
                }}
            />

            <MenuItem
                text="Copy"
                icon={<CopyIcon size={16} />}
                onClick={() => handleAction("copy")}
            />

            <MenuItem
                text="Forward"
                icon={<ForwardIcon size={16} />}
                onClick={() => handleAction("forward")}
            />

            <MenuItem
                text="Star"
                icon={<StarIcon size={16} />}
                onClick={() => handleAction("star")}
            />

            <div className="w-full h-[1px] bg-gray-600 my-2" />

            <MenuItem
                text="Report"
                icon={<FlagIcon size={16} />}
                onClick={() => handleAction("report")}
            />

            <MenuItem
                text="Delete Message"
                danger
                icon={<TrashIcon size={16} />}
                onClick={() => handleAction("delete")}
            />
        </div>
    );
});


const MenuItem = memo(function MenuItem({ text, icon, onClick, danger }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 w-full py-2 px-3 hover:bg-gray-700 cursor-pointer ${danger ? "text-red-500" : ""
                }`}
        >
            {icon}
            {text}
        </button>
    );
});

export default DropdownMenu;
