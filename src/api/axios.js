import axios from "axios";

const token = localStorage.getItem("token");

const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token"); // or accessToken

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.log("Unauthorized — maybe token expired");
            // Optional:
            // logout()
            // window.location.href = "/login"
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
