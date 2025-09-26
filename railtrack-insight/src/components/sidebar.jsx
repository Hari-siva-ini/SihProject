import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, QrCode, Package, BarChart3,Eye, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: "Generate QR", icon: <QrCode size={20} />, path: "/" },
    { name: "Inventory", icon: <Package size={20} />, path: "/inventory" },
    { name: "AI Analysis", icon: <BarChart3 size={20} />, path: "/ai-analysis" },
    { name: "DataBase", icon: <LayoutDashboard size={20} />, path: "/database" },
    { name: "DetailsPage", icon: <Eye size={20} />, path: "/details?id=" },
    { name: "Alert", icon: <AlertCircle size={20} />, path: "/alerts" },
  ];

  return (
    <motion.div
      initial={{ x: -200 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.6 }}
      className="w-72 h-screen bg-gradient-to-b from-indigo-800 to-indigo-950 p-6 shadow-2xl"
    >
      <h2 className="text-2xl font-bold mb-10 text-yellow-400">
        RailTrack Insight
      </h2>
      <ul>
        {menuItems.map((item, index) => (
          <motion.li
            key={index}
            whileHover={{ scale: 1.05, x: 8 }}
          >
            <Link
              to={item.path}
              className={`flex items-center gap-3 mb-6 px-3 py-2 rounded-xl transition-all ${
                location.pathname === item.path
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold"
                  : "text-gray-300 hover:text-white hover:bg-indigo-700"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export default Sidebar;
