export function ChatListSkeleton() {
    return (
        <div className="p-3 space-y-4">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full shimmer" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/2 rounded shimmer" />
                        <div className="h-3 w-1/3 rounded shimmer" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ChatHeaderSkeleton() {
    return (
        <div className="h-14  px-4 flex items-center gap-3 border-b border-[#2a3942] bg-[#202c33]">
            <div className="w-14 h-10 rounded-full shimmer" />
            <div className="flex-1 space-y-2">
                <div className="h-5 w-36 rounded shimmer" />
                <div className="h-3 w-24 rounded shimmer" />
            </div>
        </div>
    );
}

export function MessagesSkeleton() {
    return (
        <div className="flex flex-col gap-3 p-4">
            {[...Array(10)].map((_, i) => {
                const isMe = i % 2 === 0;
                return (
                    <div
                        key={i}
                        className={`max-w-[60%] h-8 rounded-lg shimmer ${isMe ? "ml-auto" : "mr-auto"
                            }`}
                    >
                        <div className="h-3 w-32 rounded shimmer" />
                    </div>
                );
            })}
        </div>
    );
}

export function InputSkeleton() {
    return (
        <div className="absolute bottom-0 w-full h-16 px-4 flex items-center gap-3 border-t border-[#2a3942] bg-[#202c33]">
            <div className="w-10 h-10 rounded-full shimmer" />
        </div>
    );
}
