import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { getChats, markAsDeliveredApi } from "../api/chatApi";
import echo from "../lib/bootstrap";


const ChatListContext = createContext();

export function ChatListProvider({ children }) {
    const [chats, setChats] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loadingChats, setLoadingChats] = useState(false);


    /* ================= LOAD CHATS ================= */

    const loadChats = useCallback(async () => {
        setLoadingChats(true);
        try {
            const data = await getChats();
            setChats(data);
        } finally {
            setLoadingChats(false);
        }
    }, []);

    /* ================= GLOBAL PRESENCE ================= */

    useEffect(() => {
        const channel = echo.join("online");

        channel.here(async (users) => {
            setOnlineUsers(users);
            await markAsDeliveredApi();
        });

        channel.joining((user) => {
            setOnlineUsers((prev) => [...prev, user]);
        });

        channel.leaving((user) => {
            setOnlineUsers((prev) =>
                prev.filter((u) => u.id !== user.id)
            );
        });

        return () => echo.leave("online");
    }, []);


    /* ================= MEMOS ================= */

    const onlineIds = useMemo(
        () => new Set(onlineUsers.map((u) => u.id)),
        [onlineUsers]
    );


    const isUserOnline = useCallback(
        (id) => onlineIds.has(id),
        [onlineIds]
    );

    useEffect(() => {
        loadChats();
    }, [loadChats]);

    const value = useMemo(
        () => ({
            chats,
            setChats,
            loadingChats,
            onlineUsers,
            isUserOnline,
            loadChats,
        }),
        [chats, loadingChats, onlineUsers, isUserOnline, loadChats]
    );

    return (
        <ChatListContext.Provider value={value}>
            {children}
        </ChatListContext.Provider>
    );
}

export const useChatList = () => useContext(ChatListContext);