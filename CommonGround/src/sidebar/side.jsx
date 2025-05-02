import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaHome,
  FaUser,
  FaBell,
  FaComments,
  FaSyncAlt,
  FaQuestionCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import "../dashboard.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleProfileNavigation = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        navigate("/profile");
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded.id;

      if (userId) {
        navigate(`/profile/${userId}`);
      } else {
        navigate("/profile");
      }
    } catch (error) {
      console.error("Token decode failed");
      navigate("/profile");
    }

    toggleSidebar();
  };

  const navItems = [
    { icon: <FaHome />, label: "Dashboard", route: "/dashboard" },
    { icon: <FaUser />, label: "Profile", action: handleProfileNavigation },
    { icon: <FaBell />, label: "Notifications", route: "/notifications" },
    { icon: <FaComments />, label: "Chat", route: "/chat" },
    { icon: <FaSyncAlt />, label: "Updates", route: "/updates" },
    { icon: <FaQuestionCircle />, label: "Help", route: "/help" },
    { icon: <FaSignOutAlt />, label: "Logout", route: "/login" },
  ];

  return (
    <motion.div
      className={`sidebar ${isOpen ? "open" : ""}`}
      initial={{ x: -250 }}
      animate={{ x: isOpen ? 0 : -250 }}
      transition={{ duration: 0.25 }}
    >
      <ul>
        {navItems.map((item, index) => (
          <li
            key={index}
            onClick={() => {
              if (item.action) {
                item.action();
              } else {
                navigate(item.route);
                toggleSidebar();
              }
            }}
          >
            <span style={{ marginRight: "12px" }}>{item.icon}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default Sidebar;
