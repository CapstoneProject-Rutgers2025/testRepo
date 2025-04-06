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
  FaSignOutAlt 
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
  
      const decoded = jwtDecode(token); // ✅ FIXED HERE
      const userId = decoded.id;
  
      if (userId) {
        navigate(`/profile/${userId}`);
      } else {
        console.warn("No userId in token, falling back to /profile");
        navigate("/profile");
      }
    } catch (error) {
      console.error("Token decode failed, navigating to fallback profile page");
      navigate("/profile");
    }
  
    toggleSidebar();
  };
  

  return (
    <motion.div
      className={`sidebar ${isOpen ? "open" : ""}`}
      initial={{ x: -250 }}
      animate={{ x: isOpen ? 0 : -250 }}
      transition={{ duration: 0.3 }}
    >
      <ul>
        <li onClick={() => { navigate("/dashboard"); toggleSidebar(); }}>
          <FaHome /> Dashboard
        </li>
        <li onClick={handleProfileNavigation}>
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
