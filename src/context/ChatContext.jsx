import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getChats, getMessages, markAsDeliveredApi, markAsSeenApi, openChatApi, sendMessage } from "../api/chatApi";
import echo from "../lib/bootstrap";
import axios from "axios";

// import { fakeChats } from "../data/mockChats";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  /* ================= USER ================= */

  const userRef = useRef(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const user = userRef.current;
  const token = localStorage.getItem("token");

  /* ================= STATE ================= */

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [usersInChat, setUsersInChat] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  const [showChat, setShowChat] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);

  /* ================= REFS ================= */

  const activeChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* ================= SELECTION ================= */

  const [panelStack, setPanelStack] = useState([]);
  const [selectionMode, setSelectionMode] = useState('');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectionChatMode, setSelectionChatMode] = useState('');
  const [selectedChats, setSelectedChats] = useState([]);


  /* ================= MEMOS ================= */

  const otherUser = useMemo(() => {
    if (!activeChat) return null;
    return activeChat.users.find((u) => u.id !== user?.id);
  }, [activeChat, user?.id]);

  const onlineIds = useMemo(
    () => new Set(onlineUsers.map((u) => u.id)),
    [onlineUsers]
  );

  const userIsOnline = useMemo(() => {
    if (!otherUser) return false;
    return onlineIds.has(otherUser.id);
  }, [onlineIds, otherUser]);

  const UserExistInChat = useMemo(() => {
    if (!otherUser) return false;
    return usersInChat.some((u) => u.id === otherUser.id);
  }, [usersInChat, otherUser]);

  const isUserOnline = useCallback(
    (id) => onlineIds.has(id),
    [onlineIds]
  );

  /* ================= LOADERS ================= */

  const loadChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      const data = await getChats();
      setChats(data);
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const loadMessages = useCallback(async (chatId) => {
    setLoadingMessages(true);
    try {
      const { data } = await getMessages(chatId);
      setMessages(data.reverse());
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const openChat = useCallback(async (userId) => {
    const { data } = await openChatApi(userId);
    setShowChat(true);
    setActiveChat(data);
    loadMessages(data.id);
  }, [loadMessages]);

  const handleSeen = useCallback(async () => {
    if (!activeChat) return;
    await markAsSeenApi(activeChat.id);
  }, [activeChat]);

  /* ================= ONLINE PRESENCE ================= */

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
      setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id));
    });

    return () => {
      echo.leave("online");
    };
  }, []);

  /* ================= CHAT REALTIME ================= */

  useEffect(() => {
    if (!activeChat) return;

    if (activeChannelRef.current) {
      echo.leave(activeChannelRef.current);
    }

    const channelName = `private-chat.${activeChat.id}`;
    activeChannelRef.current = channelName;

    const channel = echo.private(`chat.${activeChat.id}`);

    // 📩 message
    channel.listen("MessageSent", (e) => {
      if (e.user.id === user.id) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === e.id)) return prev;
        return [...prev, e];
      });
    });

    // ✍️ typing
    channel.listenForWhisper("typing", (e) => {
      if (e.user_id === user.id) return;

      setTypingUser(e);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(
        () => setTypingUser(null),
        2000
      );
    });

    return () => {
      echo.leave(`private-chat.${activeChat.id}`);
    };
  }, [activeChat, user.id]);

  /* ================= CHAT PRESENCE ================= */

  useEffect(() => {
    if (!activeChat) return;

    const presence = echo.join(`presence.chat.${activeChat.id}`);

    presence.here((users) => {
      setUsersInChat(users);
      handleSeen();
    });

    presence.joining((user) => {
      setUsersInChat((prev) => [...prev, user]);
      handleSeen();
    });

    presence.leaving((user) => {
      setUsersInChat((prev) => prev.filter((u) => u.id !== user.id));
    });

    return () => {
      echo.leave(`presence.chat.${activeChat.id}`);
    };
  }, [activeChat, handleSeen]);




  /* ================= SEND MESSAGE ================= */

  const handleSendMessage = useCallback(
    async (payload, type = "text") => {
      if (!activeChat) return;

      const tempId = Date.now();

      const optimisticMessage = {
        id: tempId,
        chat_id: activeChat.id,
        body: payload.body,
        type,
        file_path: payload.file_path,
        created_at: new Date().toISOString(),
        user,
        user_id: user.id,
        is_delivered: userIsOnline ? 1 : 0,
        is_seen: userExistsInChat ? 1 : 0,
        reply_to: payload.reply_to,
        reply_message: payload.reply_message,
        pending: true,
        uploadProgress: 0,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        let response;

        if (type === "file") {
          const { data } = await axios.post(
            "http://localhost:8000/api/messages",
            payload,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
              onUploadProgress: (e) => {
                const percent = Math.round(
                  (e.loaded * 100) / e.total
                );
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === tempId
                      ? { ...m, uploadProgress: percent }
                      : m
                  )
                );
              },
            }
          );
          response = data;
        } else {
          response = await sendMessage(payload);
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                ...response,
                pending: false,
                is_delivered: userIsOnline ? 1 : 0,
                is_seen: UserExistInChat?.id ? 1 : 0,
              }
              : m
          )
        );

        // update chat preview
        setChats((prev) => {
          const idx = prev.findIndex((c) => c.id === activeChat.id);
          if (idx === -1) return prev;

          const updated = {
            ...prev[idx],
            last_message: response,
          };

          return [updated, ...prev.filter((c) => c.id !== activeChat.id)];
        });

        return response;
      } catch (err) {
        setMessages((prev) =>
          prev.filter((m) => m.id !== tempId)
        );
        console.error(err);
      }
    },
    [activeChat, user, token, userIsOnline, UserExistInChat]
  );

  /* ================= TYPING ================= */

  const sendTyping = useCallback(() => {
    if (!activeChat) return;

    echo.private(`chat.${activeChat.id}`).whisper("typing", {
      user_id: user.id,
      activeChat_id: activeChat.id,
    });
  }, [activeChat, user.id]);

  /* ================= INIT ================= */

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  /* ---------------- UI PANELS ---------------- */

  const openProfile = () => setPanelStack(["profile"]);
  const openEditProfile = () =>
    setPanelStack((prev) => [...prev, "editProfile"]);
  const goBackPanel = () =>
    setPanelStack((prev) => prev.slice(0, -1));
  const closeAllPanels = () => setPanelStack([]);
  const profileOpen = panelStack.includes("profile");
  const editProfileOpen = panelStack.includes("editProfile");


  // selectiona //

  const toggleMessageSelection = (id) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const clearSelection = () => {
    setSelectionMode(false);
    setSelectedMessages([]);
  };

  const clearChatSelection = () => {
    setSelectionChatMode(false);
    setSelectedChats([]);
  };



  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        setActiveChat,
        showChat,
        messages,
        loadingMessages,
        loadingChats,
        selectionMode,
        setSelectionMode,
        selectedMessages,
        setSelectedMessages,
        toggleMessageSelection,
        clearSelection,
        setMessages,
        setChats,
        selectionChatMode,
        setSelectionChatMode,
        setSelectedChats,
        selectedChats,
        clearChatSelection,
        openProfile,
        openEditProfile,
        goBackPanel,
        closeAllPanels,
        profileOpen,
        editProfileOpen,
        panelStack,
        user,
        onlineUsers,
        isUserOnline,
        usersInChat,
        loadMessages,
        sendTyping,
        handleSendMessage,
        UserExistInChat,
        typingUser,
        currentUser: user
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
