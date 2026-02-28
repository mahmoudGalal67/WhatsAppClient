import axiosInstance from "./axios";


// Users

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

export const updateProfile = async (payload) => {
    const { data } = await axiosInstance.post("/users/edit", payload);
    return data;

};

// Contacts

export const getContacts = async () => {
    const { data } = await axiosInstance.get("/users");
    return data;
};


// Chats

export const getChats = async () => {
    const { data } = await axiosInstance.get("/chats");
    return data;
};

export const addChat = async (payload) => {
    const { data } = await axiosInstance.post("/chats/private", { user_one_id: payload.user_one_id, other_user_ids: payload.other_user_ids });
    return data;
};

export const addMultiChat = async (payload) => {
    const { data } = await axiosInstance.post("/chats/multi", { user_one_id: payload.user_one_id, other_users: payload.other_users });
    return data;
};

export const deleteChats = async (ids) => {
    const { data } = await axiosInstance.post(`/chats/delete`, { chat_ids: ids });
};

export const openChatApi = async (userId) => {
    const { data } = await axiosInstance.post("/chats/open", { user_id: userId });
    return data;
}


// Messages

export const getMessages = async (chatId, config = {}) => {
    const { data } = await axiosInstance.get(`/chats/${chatId}/messages`, config);
    return data;
};

export const sendMessage = async (payload) => {
    const { data } = await axiosInstance.post('/messages', payload);

    return data;
};
export const shareMessage = async (payload) => {
    const { data } = await axiosInstance.post('/messages/share', payload);

    return data;
};

export const deleteMessages = async (target_chat_id, message_ids, type = 'everyone') => {
    const { data } = await axiosInstance.post(`/messages/delete-multiple`, { target_chat_id, message_ids, type });
    return data;
};

export const markAsDeliveredApi = async () => {
    await axiosInstance.post("/messages/mark-delivered");
};

export const markAsSeenApi = async (chatId) => {
    await axiosInstance.post(`/messages/mark-seen/${chatId}`);
};

export const forwardMessage = async (payload) => {
    const { data } = await axiosInstance.post("/messages/forward", { message_ids: payload.message_ids, target_chat_ids: payload.target_chat_ids, is_delivered: payload.is_delivered, is_seen: payload.is_seen });
    return data
};

