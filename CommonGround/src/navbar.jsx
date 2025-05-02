import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBars, FaHome, FaQuestionCircle } from "react-icons/fa";
import "./dashboard.css";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  return (
    <header className="navbar-modern">
      <div className="navbar-left">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className="icon-button"
        >
          <FaBars />
        </motion.button>
      </div>

      <div className="navbar-right">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="icon-button"
          onClick={() => navigate("/dashboard")}
        >
          <FaHome />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="icon-button"
          onClick={() => navigate("/help")}
        >
          <FaQuestionCircle />
        </motion.button>
      </div>
    </header>
  );
};

export default Navbar;
