import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHome, FaUser, FaBell, FaComments, FaSyncAlt, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";
import "../dashboard.css"; // Ensure correct path

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className={`sidebar ${isOpen ? "open" : ""}`}
      initial={{ x: -250 }}
      animate={{ x: isOpen ? 0 : -250 }}
      transition={{ duration: 0.3 }}
    >
      {/* ✅ Sidebar Menu */}
      <ul>
        <li onClick={() => { navigate("/dashboard"); toggleSidebar(); }}>
          <FaHome /> Dashboard
        </li>
        <li onClick={() => { navigate("/profile"); toggleSidebar(); }}>
          <FaUser /> Profile
        </li>
        <li onClick={() => { navigate("/notifications"); toggleSidebar(); }}>
          <FaBell /> Notifications
        </li>
        <li onClick={() => { navigate("/chat"); toggleSidebar(); }}>
          <FaComments /> Chat
        </li>
        <li onClick={() => { navigate("/updates"); toggleSidebar(); }}>
          <FaSyncAlt /> Updates
        </li>
        <li onClick={() => { navigate("/help"); toggleSidebar(); }}>
          <FaQuestionCircle /> Help
        </li>
        <li onClick={() => { navigate("/login"); toggleSidebar(); }}>
          <FaSignOutAlt /> Logout
        </li>
      </ul>
    </motion.div>
  );
};

export default Sidebar;
