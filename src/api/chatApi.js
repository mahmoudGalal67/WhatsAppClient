import axiosInstance from "./axios";


export const loginRequest = async (email, password) => {
    const { data } = await axiosInstance.post("/login", {
        email,
        password,
    });

    return data;
};
export const RegisterRequest = async (form) => {
    const { data } = await axiosInstance.post("/register", {
        ...form,
    });

    return data;
};

export const getChats = async () => {
    const { data } = await axiosInstance.get("/chats");
    return data;
};

export const addChat = async (payload) => {
    const { data } = await axiosInstance.post("/chats/by-phone", { phoneNumber: payload.phoneNumber, name: payload.name, imageUrl: payload.imageUrl });
    return data;
};
export const deleteChat = async (id) => {
    const { data } = await axiosInstance.delete(`/chats/${id}`);
};
export const deleteChats = async (ids) => {
    const { data } = await axiosInstance.post(`/chats/bulk-delete`, { chatIds: ids });
};

export const openChatApi = async (userId) => {
    const { data } = await axiosInstance.post("/chats/open", { user_id: userId });
    return data;
}

export const markAsRead = async (chatId) => {
    await axiosInstance.post(`/chats/${chatId}/read`);
};

export const getMessages = async (chatId) => {
    const { data } = await axiosInstance.get(`/chats/${chatId}/messages`);
    return data;
};
export const deleteMessages = async (chatId, messageIds) => {
    const { data } = await axiosInstance.delete(`/chats/${chatId}/messages/bulk`, { data: { messageIds } });
    return data;
};

export const getContacts = async () => {
    const { data } = await axiosInstance.get("/contacts");
    return data;
};

export const sendMessage = async (payload) => {
    const { data } = await axiosInstance.post('/messages', payload);

    return data;
};
