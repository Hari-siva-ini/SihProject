import { useState, useEffect, useRef } from "react";
import { Home, QrCode, Settings, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function FooterNav() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const settingsRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown or confirmation when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
        setConfirmLogout(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirmLogout = () => navigate("/login");

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-indigo-900 via-blue-900 to-black text-white border-t border-white/20">
      <div className="flex justify-around py-3 relative">
        {/* Home */}
        <button className="flex flex-col items-center hover:text-yellow-400">
          <Home size={22} />
          <span className="text-xs">Home</span>
        </button>

        {/* QR Generator */}
        <Link to="/" className="flex flex-col items-center hover:text-yellow-400">
          <QrCode size={22} />
          <span className="text-xs">QR</span>
        </Link>

        {/* Settings */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex flex-col items-center hover:text-yellow-400"
          >
            <Settings size={22} />
            <span className="text-xs">Settings</span>
          </button>

          {/* Dropdown menu */}
          {settingsOpen && !confirmLogout && (
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white rounded-md shadow-lg py-1 w-36 flex flex-col items-start z-50">
              <button
                onClick={() => setConfirmLogout(true)}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-white/20 rounded"
              >
                <LogOut size={18} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}

          {/* Logout Confirmation */}
          {confirmLogout && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-4 rounded-md shadow-lg w-48 flex flex-col items-center gap-2 z-50">
              <p className="text-sm text-center">Are you sure you want to logout?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmLogout}
                  className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
