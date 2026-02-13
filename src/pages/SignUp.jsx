import React, { useState } from "react";
import { Facebook, Eye, EyeOff } from "lucide-react";
import api from "../api/axios"; // adjust path if needed
import { useNavigate } from "react-router-dom";
import { RegisterRequest } from "../api/chatApi";

const SignUp = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    role: "string",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await RegisterRequest(form);

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f2f5] to-[#e4e6eb] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-[#0F796D] p-8 text-center">
          <img className="w-[67px] h-[67px] mx-auto mb-2" src="logo.png" alt="" />
          <h1 className="text-white text-2xl font-bold">WhatsApp Business</h1>
          <p className="text-[#d1f7cb] text-sm">Manage your business conversations</p>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-left">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-sm mb-6 text-left">
            Sign in to continue to your account
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* username */}
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                name="username"
                type="text"
                placeholder="Username"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25d366]"
              />
            </div>
            {/* Email */}
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                name="email"
                type="text"
                placeholder="Email"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25d366]"
              />
            </div>

            {/* Password */}
            <div className="text-left relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25d366] pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[42px] text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#25d366] hover:bg-[#20bd5c] text-white font-semibold py-3 rounded-lg transition cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          {/* Divider */}


          {/* Footer Note - based on the image showing "ahmed baz_" at top */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              By signing in, you agree to our Terms and Privacy Policy
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignUp;
