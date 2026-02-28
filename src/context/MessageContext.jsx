import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getMessages, sendMessage } from "../api/chatApi";
import echo from "../lib/bootstrap";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useActiveChat } from "./ActiveChatContext";
import { useChatList } from "./ChatListContext";

const MessageContext = createContext();

export function MessageProvider({ children }) {
  const messageAbortRef = useRef(null);
  const messagesCacheRef = useRef(new Map());
  const loadingChatIdRef = useRef(null);
  const { user, token } = useAuth();
  const { activeChat, UserExistInChat, otherUser } =
    useActiveChat();
  const { setChats, isUserOnline } = useChatList();

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] =
    useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const typingTimeoutRef = useRef(null);
  const activeChannelRef = useRef(null);

  /* ================= LOAD ================= */

  const loadMessages = useCallback(async (chatId) => {
    // ✅ prevent duplicate loads
    if (loadingChatIdRef.current === chatId) return;

    // ✅ serve from cache instantly
    // if (messagesCacheRef.current.has(chatId)) {
    //   setMessages(messagesCacheRef.current.get(chatId));
    //   return;
    // }

    // ✅ cancel previous request
    if (messageAbortRef.current) {
      messageAbortRef.current.abort();
    }

    const controller = new AbortController();
    messageAbortRef.current = controller;
    loadingChatIdRef.current = chatId;

    setLoadingMessages(true);

    try {
      const { data } = await getMessages(chatId, {
        signal: controller.signal,
      });

      const normalized = data.reverse();

      // ✅ cache it
      messagesCacheRef.current.set(chatId, normalized);

      // ✅ only set if still active
      if (loadingChatIdRef.current === chatId) {
        setMessages(normalized);
      }
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        console.error(err);
      }
    } finally {
      if (loadingChatIdRef.current === chatId) {
        setLoadingMessages(false);
        loadingChatIdRef.current = null;
      }
    }
  }, []);

  /* ================= REALTIME ================= */

  useEffect(() => {
    if (!activeChat) return;

    if (activeChannelRef.current) {
      echo.leave(activeChannelRef.current);
    }

    const channelName = `chat.${activeChat.id}`;
    activeChannelRef.current = channelName;

    const channel = echo.private(channelName);

    channel.listen("MessageSent", (e) => {
      if (e.user.id === user.id) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === e.id)) return prev;
        return [...prev, e];
      });
    });

    channel.listenForWhisper("typing", (e) => {
      if (e.user_id === user.id) return;

      setTypingUser(e);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(
        () => setTypingUser(null),
        2000
      );
    });

    return () => echo.leave(channelName);
  }, [activeChat, user.id]);

  /* ================= SEND ================= */

  const handleSendMessage = useCallback(

    async (payload, type = "text") => {
      const payloadData = {
        chat_id: activeChat.id,
        body: payload.get("body"),
        type: payload.get("type"),
        user_id: user.id,
        is_delivered: payload.get("is_delivered") ?? (isUserOnline(otherUser?.id) ? 1 : 0),
        is_seen: UserExistInChat ? 1 : 0,
      };

      // Only add optional fields if they exist
      if (payload.get("file") && payload.get("file") != 'null') payloadData.file = payload.get("file");
      if (payload.get("file_path") && payload.get("file_path") != 'null') payloadData.file_path = payload.get("file_path");
      if (payload.get("reply_to") && payload.get("reply_to") != 'null') payloadData.reply_to = payload.get("reply_to");
      if (payload.get("reply_message") && payload.get("reply_message") != 'null') payloadData.reply_message = payload.get("reply_message");

      if (!activeChat) return;
      const tempId = Date.now();
      const optimisticMessage = {
        id: tempId,
        chat_id: activeChat.id,
        body: payload.get("body"),
        type,
        reply_to: payload.get("reply_to"),
        reply_message: payload.get("reply_message"),
        file_path: payload.get("file_path"),
        file: payload.get("file"),
        file_name: payload.get("file")?.name,
        file_size: payload.get("file")?.size,
        created_at: new Date().toISOString(),
        user,
        user_id: user.id,
        is_delivered: payload.get("is_delivered") ?? isUserOnline(
          otherUser?.id
        )
          ? 1
          : 0,
        is_seen: UserExistInChat ? 1 : 0,
        pending: true,
        uploadProgress: 0,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      try {
        const response =
          type === "file" || type === "excel"
            ? (
              await axios.post(
                import.meta.env.VITE_API_URL + "/api/messages",
                payload,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === tempId
                          ? { ...m, uploadProgress: percentCompleted }
                          : m
                      )
                    );
                    console.log(messages);
                  },
                }
              )
            ).data
            :

            await sendMessage(payloadData);


        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...response, pending: false, is_delivered: isUserOnline(otherUser?.id) ? 1 : 0, is_seen: UserExistInChat ? 1 : 0 }
              : m
          )
        );

        setChats((prev) => {
          const idx = prev.findIndex(
            (c) => c.id === activeChat.id
          );
          if (idx === -1) return prev;

          const updated = {
            ...prev[idx],
            last_message: response,
          };

          return [
            updated,
            ...prev.filter(
              (c) => c.id !== activeChat.id
            ),
          ];
        });
      } catch (err) {
        setMessages((prev) =>
          prev.filter((m) => m.id !== tempId)
        );
      }
    },
    [
      activeChat,
      user,
      token,
      setChats,
      UserExistInChat,
      isUserOnline,
    ]
  );

  /* ================= TYPING ================= */

  const sendTyping = useCallback(() => {
    if (!activeChat) return;

    echo.private(`chat.${activeChat.id}`).whisper(
      "typing",
      {
        user_id: user.id,
      }
    );
  }, [activeChat, user.id]);

  const value = useMemo(
    () => ({
      messages,
      setMessages,
      loadingMessages,
      loadMessages,
      typingUser,
      handleSendMessage,
      sendTyping,
    }),
    [
      messages,
      loadingMessages,
      loadMessages,
      typingUser,
      handleSendMessage,
      sendTyping,
    ]
  );

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
}

export const useMessages = () =>
  useContext(MessageContext);