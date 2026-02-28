import { Download, FileText, Loader2 } from "lucide-react";

function FilePreview({ message, url }) {
    switch (message.type) {
        case "image":
            return (
                <img
                    src={url || message.file_path}
                    className="rounded-lg max-w-[220px]"
                />
            );

        case "video":
            return (
                <video
                    controls
                    className="rounded-lg max-w-[240px] mr-10"
                    src={url}
                />
            );
        default:
            const radius = 18;
            const circumference = 2 * Math.PI * radius;
            const dashOffset = circumference - (message.uploadProgress / 100) * circumference;

            return (
                <div className="max-w-[340px] text-white">
                    <div className="bg-[#202c33] rounded-2xl p-3 flex items-center gap-8 shadow-md">
                        {/* File Info */}
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-[#2a3942] flex items-center justify-center shrink-0">
                                <FileText size={20} className="text-gray-300" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-400">{message?.file_name?.split(".")[1]} • {(message?.file_size / 1024 / 1024).toFixed(2)} MB</p>
                                <p className="text-sm font-medium truncate">{message?.file_name}</p>
                            </div>
                        </div>

                        {/* WhatsApp-style progress circle */}
                        <button
                            onClick={() => { }}
                            className="relative w-10 h-10 flex items-center justify-center disabled:opacity-60"
                        >
                            {/* background circle */}
                            <svg
                                className="absolute inset-0 -rotate-90"
                                width="40"
                                height="40"
                            >
                                <circle
                                    cx="20"
                                    cy="20"
                                    r={radius}
                                    stroke="#3b4a54"
                                    strokeWidth="2.5"
                                    fill="transparent"
                                />

                                {/* progress circle */}
                                {true && (
                                    <circle
                                        cx="20"
                                        cy="20"
                                        r={radius}
                                        stroke="#25D366"
                                        strokeWidth="2.5"
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={dashOffset}
                                        strokeLinecap="round"
                                        className="transition-all duration-200"
                                    />
                                )}
                            </svg>
                            {/* center icon */}
                            <div
                                disabled={message.pending}
                                onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = `${import.meta.env.VITE_APP_URL}/storage/${message.file_path}`;
                                    link.download = message.file_name || "file";
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-[#202c33] hover:bg-[#2a3942] transition cursor-pointer relative z-10">
                                <Download size={16} />
                            </div>
                        </button>
                    </div>

                </div >
            );
    }
}

export default FilePreview;
