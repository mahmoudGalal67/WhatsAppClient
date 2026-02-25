import { createContext, useContext, useMemo } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    }, []);

    const token = useMemo(
        () => localStorage.getItem("token"),
        []
    );

    return (
        <AuthContext.Provider value={{ user, token }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);