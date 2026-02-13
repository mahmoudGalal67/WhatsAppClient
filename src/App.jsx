import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ChoosePage from "./pages/ChoosePage";
import ChatPage from "./pages/ChatPage";

function App() {
  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/signIn" />;
  };

  const PublicRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? <Navigate to="/chats" /> : children;
  };

  return (
    <div>
      <Routes>
        <Route path="/" element={<PublicRoute><SignIn /></PublicRoute>} />
        <Route path="/signUp" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/choose" element={<PublicRoute><ChoosePage /></PublicRoute>} />
        <Route path="/chats" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </div>
  );
}

export default App;
