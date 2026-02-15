import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getChats, getMessages, markAsDeliveredApi, markAsRead, markAsSeenApi, openChatApi, sendMessage } from "../api/chatApi";
import echo from "../lib/bootstrap";

import { fakeChats } from "../data/mockChats";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const userRef = useRef(JSON.parse(localStorage.getItem("user")) || null);
  const user = userRef.current;

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
  const [selectionMode, setSelectionMode] = useState('');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectionChatMode, setSelectionChatMode] = useState('');
  const [selectedChats, setSelectedChats] = useState([]);

  const otherUser = activeChat?.users.find((u) => u.id !== user.id)
  const UserExistInChat = usersInChat.find((u) => u.id === otherUser?.id)
  const onlineIds = new Set(onlineUsers.map(u => u.id));

  const userIsOnline = activeChat?.users.some(user =>
    onlineIds.has(otherUser.id)
  );


  /* ---------------- LOADERS ---------------- */

  const loadChats = async () => {
    // const data = await getChats();
    setChats(fakeChats);
  };

  const loadMessages = async (chatId) => {
    // const { data } = await getMessages(chatId);
    setMessages(fakeChats[0].messages.reverse());
  };

  const openChat = async (userId) => {
    // const { data } = await openChatApi(userId);
    setShowChat(true);
    setActiveChat(fakeChats[0]);
    loadMessages(fakeChats[0].id);
  };

  const handleMarkAsRead = async (chatId) => {
    await markAsRead(chatId);
  };

  const handleDelivered = async () => {
    await markAsDeliveredApi();
    if (activeChat) {
      loadMessages(activeChat.id);
    }
  };

  const handleSeen = async (users) => {
    if (!activeChat) return;
    await markAsSeenApi(activeChat.id);
    loadMessages(activeChat.id);
  }

  /* ---------------- GLOBAL ONLINE PRESENCE ---------------- */

  useEffect(() => {
    const channel = echo.join("online");

    channel.here(async (users) => {
      setOnlineUsers(users);
      await markAsDeliveredApi();
      if (activeChat) {
        loadMessages(activeChat.id);
      }
    });
    channel.joining(async (user) => {
      setOnlineUsers((prev) => [...prev, user])
      await markAsDeliveredApi();
      if (activeChat) {
        loadMessages(activeChat.id);
      }
    });
    channel.leaving((user) => {
      setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id))
    });

    return () => echo.leave("online");
  }, [usersInChat]);

  const isUserOnline = (id) => onlineUsers.some((u) => u.id === id);

  /* ---------------- CHAT REALTIME ---------------- */

  useEffect(() => {
    if (!activeChat) return;

    // Leave old channel
    if (activeChannelRef.current) {
      echo.leave(activeChannelRef.current);
    }

    const channelName = `private-chat.${activeChat.id}`;
    activeChannelRef.current = channelName;

    const channel = echo.private(`chat.${activeChat.id}`);

    // 📩 New message
    channel.listen("MessageSent", (e) => {
      // Ignore own messages (already added optimistically)
      if (e.user.id == user.id) return;

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === e.id);
        if (exists) return prev;
        return [...prev, e];
      });
    });
    // ✍️ Typing indicator
    channel.listenForWhisper("typing", (e) => {
      if (e.user_id === user.id) return;

      setTypingUser(e.user_id);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser(null);
      }, 2000);
    });

    return () => {
      echo.leave(channelName);
    };
  }, [activeChat]);

  /* ---------------- CHAT PRESENCE (VIEWING CHAT) ---------------- */

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
        handleSeen(updated); // ✅ pass updated state
        return updated;
      });
    });
    presenceChannel.leaving((user) =>
      setUsersInChat((prev) => prev.filter((u) => u.id !== user.id))
    );

    return () => echo.leave(`presence.chat.${activeChat.id}`);
  }, [activeChat]);


  useEffect(() => {
    if (!user?.id) return;

    const channel = echo.private(`user.${user.id}`);

    channel.listen("MessageSent", (e) => {
      console.log("User channel event:", e);
      if (activeChat && activeChat.id === e.chat_id) {
        return;
      }
      setChats((prevChats) =>
        prevChats.map((chat) => {
          return {
            ...chat,
            unread_count: chat.unread_count + 1,
            last_message: e,
          };
        })
      );
    });

    return () => {
      echo.leave(`private-user.${user.id}`);
    };

  }, [user?.id, activeChat]);




  /* ---------------- SEND MESSAGE ---------------- */

  const handleSendMessage = async (payload) => {
    if (!activeChat) return;

    const tempId = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        chat_id: activeChat.id,
        body: payload.body,
        type: payload.type,
        file_path: payload.file_path,
        created_at: new Date().toISOString(),
        user: user,
        user_id: user.id,
        is_delivered: userIsOnline ? true : false,
        is_seen: UserExistInChat?.id ? true : false,
        pending: true,
      },
    ]);


    try {
      const response = await sendMessage(payload);
      // 3️⃣ Replace temp message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...response, pending: false } : m
        )
      );
      return response;
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.filter((m) => m.id !== tempId)
      );
    }
  };

  /* ---------------- TYPING SEND ---------------- */

  const sendTyping = () => {
    if (!activeChat) return;

    echo.private(`chat.${activeChat.id}`).whisper("typing", {
      user_id: user.id,
    });
  };

  /* ---------------- UI PANELS ---------------- */

  const openProfile = () => setPanelStack(["profile"]);
  const openEditProfile = () =>
    setPanelStack((prev) => [...prev, "editProfile"]);
  const goBackPanel = () =>
    setPanelStack((prev) => prev.slice(0, -1));
  const closeAllPanels = () => setPanelStack([]);
  const profileOpen = panelStack.includes("profile");
  const editProfileOpen = panelStack.includes("editProfile");

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    loadChats();
  }, []);


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
        handleMarkAsRead,
        user,
        onlineUsers,
        isUserOnline,
        usersInChat,
        loadMessages,
        sendTyping,
        handleSendMessage,
        UserExistInChat,
        typingUser
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
