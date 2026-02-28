import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { openChatApi, markAsSeenApi } from "../api/chatApi";
import echo from "../lib/bootstrap";
import { useAuth } from "./AuthContext";
import { useChatList } from "./ChatListContext";

const ActiveChatContext = createContext();

export function ActiveChatProvider({ children }) {
    const { user } = useAuth();

    const [activeChat, setActiveChat] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [usersInChat, setUsersInChat] = useState([]);
    const { setChats } = useChatList();

    /* ================= OPEN CHAT ================= */

    const openChat = useCallback(async (userId) => {
        const { data } = await openChatApi(userId);
        setActiveChat(data);
        setShowChat(true);
    }, []);

    /* ================= SEEN ================= */

    const handleSeen = useCallback(async () => {
        if (!activeChat) return;
        await markAsSeenApi(activeChat.id);
    }, [activeChat]);

    /* ================= PRESENCE ================= */

    useEffect(() => {
        if (!activeChat) return;

        const presence = echo.join(
            `presence.chat.${activeChat.id}`
        );

        presence.here((users) => {
            setUsersInChat(users);
            handleSeen();
        });

        presence.joining((user) => {
            setUsersInChat((prev) => [...prev, user]);
            handleSeen();
        });

        presence.leaving((user) => {
            setUsersInChat((prev) =>
                prev.filter((u) => u.id !== user.id)
            );
        });

        return () =>
            echo.leave(`presence.chat.${activeChat.id}`);
    }, [activeChat, handleSeen]);


    /* ---------------- USER CHANNEL ---------------- */
    useEffect(() => {
        if (!user?.id) return;

        const channel = echo.private(`user.${user.id}`);

        channel.listen("MessageSent", (e) => {
            if (activeChat && activeChat.id === e.chat_id) return;
            console.log(e);
            setChats((prevChats) => {
                const chatIndex = prevChats.findIndex(
                    (chat) => chat.id === e.chat_id
                );
                if (chatIndex === -1) return prevChats;

                const updatedChat = {
                    ...prevChats[chatIndex],
                    unread_count: (prevChats[chatIndex].unread_count || 0) + 1,
                    last_message: e,
                };

                const remainingChats = prevChats.filter(
                    (chat) => chat.id !== e.chat_id
                );

                return [updatedChat, ...remainingChats];
            });
        });

        return () => {
            echo.leave(`private-user.${user.id}`);
        };
    }, [user?.id, activeChat]);

    /* ================= MEMOS ================= */

    const otherUser = useMemo(() => {
        if (!activeChat) return null;
        return activeChat.users.find(
            (u) => u.id !== user?.id
        );
    }, [activeChat, user?.id]);

    const UserExistInChat = useMemo(() => {
        if (!otherUser) return false;
        return usersInChat.some(
            (u) => u.id === otherUser.id
        );
    }, [usersInChat, otherUser]);

    const value = useMemo(
        () => ({
            activeChat,
            setActiveChat,
            showChat,
            openChat,
            usersInChat,
            otherUser,
            UserExistInChat,
            setShowChat
        }),
        [
            activeChat,
            showChat,
            usersInChat,
            otherUser,
            UserExistInChat,
            openChat,
            setShowChat
        ]
    );

    return (
        <ActiveChatContext.Provider value={value}>
            {children}
        </ActiveChatContext.Provider>
    );
}

export const useActiveChat = () =>
    useContext(ActiveChatContext);