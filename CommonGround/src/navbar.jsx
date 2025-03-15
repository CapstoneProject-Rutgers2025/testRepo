import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { motion } from "framer-motion";
import { FaBars, FaHome, FaBell } from "react-icons/fa";
import "./dashboard.css"; // Ensure correct path

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate(); // Initialize navigate function

  return (
    <div className="navbar">
      {/* ✅ Sidebar Toggle Button */}
      <motion.div
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="menu-icon"
        onClick={toggleSidebar}
      >
        <FaBars /> {/* ✅ This toggles the sidebar */}
      </motion.div>

      {/* ✅ Navigation Icons */}
      <div className="nav-right">
        {/* Home Button - Redirects to Dashboard */}
        <motion.div
          whileHover={{ scale: 1.2 }}
          transition={{ duration: 0.2 }}
          onClick={() => navigate("/dashboard")} // Redirects to Dashboard
          style={{ cursor: "pointer" }}
        >
          <FaHome />
        </motion.div>

        {/* Notification Button - Redirects to Notifications */}
        <motion.div
          whileHover={{ scale: 1.2 }}
          transition={{ duration: 0.2 }}
          onClick={() => navigate("/notifications")} // Redirects to Notifications
          style={{ cursor: "pointer" }}
        >
          <FaBell />
        </motion.div>
      </div>
    </div>
  );
};

export default Navbar;
