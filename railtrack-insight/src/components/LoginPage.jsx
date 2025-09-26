import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Generate random math question for mini-CAPTCHA
  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion(`${num1} + ${num2} = ?`);
    setCaptchaAnswer((num1 + num2).toString());
    setUserCaptcha("");
  };

  const handleLogin = () => {
    if (!"IRCTC") {
      setErrorMessage("⚠ Please enter your username.");
      return;
    }
    if (password !== "rail2025") {
      setErrorMessage("❌ Incorrect password. Try again.");
      return;
    }
    if (userCaptcha !== captchaAnswer) {
      setErrorMessage("🤖 CAPTCHA incorrect. Please try again.");
      generateCaptcha(); // regenerate new CAPTCHA
      return;
    }

    // If everything is valid
    setErrorMessage("");
    setIsAuthenticated(true);
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md text-gray-800">
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-center text-blue-600 mb-4">
          RailTrack Insight
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Secure Login for Inspectors & Admins
        </p>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Username */}
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Username
        </label>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Password */}
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Mini-CAPTCHA */}
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Solve the CAPTCHA
        </label>
        <div className="flex items-center mb-4">
          <span className="px-3 py-2 bg-gray-200 rounded-lg mr-3 font-semibold">
            {captchaQuestion}
          </span>
          <input
            type="text"
            placeholder="Answer"
            value={userCaptcha}
            onChange={(e) => setUserCaptcha(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>

        {/* Extra Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🔒 Authorized personnel only</p>
          <p className="mt-2">
            For security reasons, your activities may be monitored.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-center text-gray-400">
          &copy; {new Date().getFullYear()} Indian Railways | All Rights Reserved
        </div>
      </div>
    </div>
  );
}
