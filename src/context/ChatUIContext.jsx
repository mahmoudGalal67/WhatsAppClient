import {
    createContext,
    useContext,
    useMemo,
    useState,
} from "react";

const ChatUIContext = createContext();

export function ChatUIProvider({ children }) {
    const [panelStack, setPanelStack] = useState([]);
    const [selectionMode, setSelectionMode] =
        useState(false);
    const [selectedMessages, setSelectedMessages] =
        useState([]);
    const [selectionChatMode, setSelectionChatMode] =
        useState(false);
    const [selectedChats, setSelectedChats] =
        useState([]);

    const openProfile = () => setPanelStack(["profile"]);
    const openEditProfile = () =>
        setPanelStack((p) => [...p, "editProfile"]);
    const goBackPanel = () =>
        setPanelStack((p) => p.slice(0, -1));
    const closeAllPanels = () => setPanelStack([]);

    const profileOpen = panelStack.includes("profile");
    const editProfileOpen =
        panelStack.includes("editProfile");

    const toggleMessageSelection = (id) => {
        setSelectedMessages((prev) =>
            prev.includes(id)
                ? prev.filter((m) => m !== id)
                : [...prev, id]
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

    const value = useMemo(
        () => ({
            panelStack,
            openProfile,
            openEditProfile,
            goBackPanel,
            closeAllPanels,
            profileOpen,
            editProfileOpen,
            selectionMode,
            setSelectionMode,
            selectedMessages,
            setSelectedMessages,
            toggleMessageSelection,
            clearSelection,
            selectionChatMode,
            setSelectionChatMode,
            selectedChats,
            setSelectedChats,
            clearChatSelection,
        }),
        [
            panelStack,
            selectionMode,
            selectedMessages,
            selectionChatMode,
            selectedChats,
        ]
    );

    return (
        <ChatUIContext.Provider value={value}>
            {children}
        </ChatUIContext.Provider>
    );
}

export const useChatUI = () =>
    useContext(ChatUIContext);