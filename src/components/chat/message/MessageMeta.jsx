import { memo } from "react";
import { formatWhatsAppDate } from "../../../utils/formatWhatsAppDate";

const MessageMeta = memo(function MessageMeta({ message, isMine }) {
    return (
        <div
            className={`flex items-center  gap-3 ${message.type === "image" ? "absolute bottom-2 right-4" : ""
                }`}
        >
            <div className="text-[10px] text-gray-300 mt-2 w-14 text-right">
                {message.whatsapp_time ||
                    formatWhatsAppDate(message.created_at)}
            </div>

            {isMine && (
                <div className={message.is_seen ? "text-blue-500" : "text-white"}>
                    {message.is_seen || message.is_delivered ? "✓✓" : "✓"}
                </div>
            )}
        </div>
    );
});

export default MessageMeta;
