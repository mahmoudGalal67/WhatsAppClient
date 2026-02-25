import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  getChats,
  getMessages,
  markAsDeliveredApi,
  markAsSeenApi,
  openChatApi,
  sendMessage,
} from "../api/chatApi";
import echo from "../lib/bootstrap";
import axios from "axios";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const userRef = useRef(JSON.parse(localStorage.getItem("user")) || null);
  const user = userRef.current;
  const token = localStorage.getItem("token");

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [usersInChat, setUsersInChat] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [panelStack, setPanelStack] = useState([]);
  const activeChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [selectionMode, setSelectionMode] = useState("");
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectionChatMode, setSelectionChatMode] = useState("");
  const [selectedChats, setSelectedChats] = useState([]);

  /* ---------------- LOAD CHATS ---------------- */
  const loadChats = async () => {
    const data = await getChats();
    setChats(data); // real
  };

  /* ---------------- LOAD MESSAGES ---------------- */
  const loadMessages = async (chatId) => {
    const { data } = await getMessages(chatId);
    setMessages(data.reverse());
  };

  /* ---------------- OPEN CHAT ---------------- */
  const openChat = async (userId) => {
    const { data } = await openChatApi(userId);
    setShowChat(true);
    setActiveChat(data);
    loadMessages(data.id);
  };

  /* ---------------- SEEN ---------------- */
  const handleSeen = async () => {
    if (!activeChat) return;
    await markAsSeenApi(activeChat.id);
    loadMessages(activeChat.id);
  };

  /* ---------------- GLOBAL ONLINE PRESENCE ---------------- */
  useEffect(() => {
    const channel = echo.join("online");

    channel.here(async (users) => {
      setOnlineUsers(users);
      await markAsDeliveredApi();
      if (activeChat) loadMessages(activeChat.id);
    });

    channel.joining((user) => {
      setOnlineUsers((prev) => [...prev, user]);
    });

    channel.leaving((user) => {
      setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id));
    });

    return () => echo.leave("online");
  }, []);

  const isUserOnline = (id) => onlineUsers.some((u) => u.id === id);

  useEffect(() => {
    const fn = async () => {
      if (onlineUsers.length > 0) {
        await markAsDeliveredApi();
        if (activeChat) loadMessages(activeChat.id);
      }
    };
    fn();
  }, [onlineUsers]);

  /* ---------------- CHAT REALTIME ---------------- */
  useEffect(() => {
    if (!activeChat) return;

    if (activeChannelRef.current) {
      echo.leave(activeChannelRef.current);
    }

    const channelName = `private-chat.${activeChat.id}`;
    activeChannelRef.current = channelName;

    const channel = echo.private(`chat.${activeChat.id}`);

    // 📩 New message
    channel.listen("MessageSent", (e) => {
      if (e.user.id === user.id) return;

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === e.id);
        if (exists) return prev;
        return [...prev, e];
      });
    });

    // ✍️ Typing
    channel.listenForWhisper("typing", (e) => {
      if (e.user_id === user.id) return;

      setTypingUser({
        user_id: e.user_id,
        activeChat_id: e.activeChat_id,
      });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser(null);
      }, 2000);
    });

    return () => {
      echo.leave(channelName);
    };
  }, [activeChat]);

  /* ---------------- CHAT PRESENCE ---------------- */
  useEffect(() => {
    if (!activeChat) return;

    const presenceChannel = echo.join(`presence.chat.${activeChat.id}`);

    presenceChannel.here((users) => {
      setUsersInChat(users);
      handleSeen(users);
    });

    presenceChannel.joining((user) => {
      setUsersInChat((prev) => {
        const updated = [...prev, user];
        handleSeen(updated);
        return updated;
      });
    });

    presenceChannel.leaving((user) =>
      setUsersInChat((prev) => prev.filter((u) => u.id !== user.id))
    );

    return () => echo.leave(`presence.chat.${activeChat.id}`);
  }, [activeChat]);

  /* ---------------- USER CHANNEL ---------------- */
  useEffect(() => {
    if (!user?.id) return;

    const channel = echo.private(`user.${user.id}`);

    channel.listen("MessageSent", (e) => {
      if (activeChat && activeChat.id === e.chat_id) return;

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

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSendMessage = async (payload, type = "text") => {
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
      pending: true,
      uploadProgress: 0,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      let data;

      if (type === "file") {
        const response = await axios.post(
          "http://localhost:8000/api/messages",
          payload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
            onUploadProgress: (progressEvent) => {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempId ? { ...m, uploadProgress: percent } : m
                )
              );
            },
          }
        );

        data = response.data;
      } else {
        data = await sendMessage(payload);
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...data, pending: false } : m
        )
      );

      return data;
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  /* ---------------- TYPING SEND ---------------- */
  const sendTyping = () => {
    if (!activeChat) return;

    echo.private(`chat.${activeChat.id}`).whisper("typing", {
      user_id: user.id,
      activeChat_id: activeChat.id,
    });
  };

  /* ---------------- PANELS ---------------- */
  const openProfile = () => setPanelStack(["profile"]);
  const openEditProfile = () =>
    setPanelStack((prev) => [...prev, "editProfile"]);
  const goBackPanel = () => setPanelStack((prev) => prev.slice(0, -1));
  const closeAllPanels = () => setPanelStack([]);

  const profileOpen = panelStack.includes("profile");
  const editProfileOpen = panelStack.includes("editProfile");

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    loadChats();
  }, []);

  /* ---------------- SELECTION ---------------- */
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
        typingUser,
        currentUser: user,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);