import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginRequest } from "../api/chatApi";
import { useNavigate } from "react-router-dom";

const GXSignInPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const data = await loginRequest(email, password);

      // 🔐 Save token
      localStorage.setItem("token", data.token);

      // Optional: save user
      localStorage.setItem("user", JSON.stringify(data.user));

      // Go to chat page
      navigate("/chats");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F796D] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-3xl shadow-md p-8 py-12"
        >
          <h2 className="text-2xl font-bold text-center text-[#0F796D] mb-8">
            Sign In
          </h2>

          {/* Email */}
          <div className="text-left mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25d366] outline-none"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div className="mb-4 text-left">
            <label className="block text-sm font-medium text-[#0F796D] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25d366] outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#47CC7C] text-white font-medium py-2.5 rounded transition cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GXSignInPage;
