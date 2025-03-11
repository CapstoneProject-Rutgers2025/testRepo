import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars,
  FaHome,
  FaBell,
  FaPlus,
  FaUser,
  FaSignOutAlt,
  FaTimes,
  FaCheck,
  FaComments,
  FaSyncAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import "./dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState([
    { id: 1, content: "🚀 This is an amazing post!", liked: null },
    { id: 2, content: "🔥 Another exciting update!", liked: null },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      try {
        const decodedToken = jwtDecode(token);
        setUser({
          full_name: decodedToken.full_name,
          email: decodedToken.email,
        });
      } catch (error) {
        navigate("/login");
      }
    }
  }, [navigate]);

  const handleSwipe = (id, liked) => {
    setPosts((prev) => {
      const swipedPost = prev.find((post) => post.id === id);
      if (!swipedPost) return prev;

      const updatedPosts = prev.map((post) =>
        post.id === id ? { ...post, liked } : post
      );

      setTimeout(() => {
        setPosts((currentPosts) => {
          const remainingPosts = currentPosts.filter((post) => post.id !== id);
          return [...remainingPosts, swipedPost]; 
        });
      }, 300);

      return updatedPosts;
    });
  };

  return user ? (
    <div className="dashboard-container">
      <motion.div
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        initial={{ x: -250 }}
        animate={{ x: sidebarOpen ? 0 : -250 }}
        transition={{ duration: 0.3 }}
      >
        <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
          ✖
        </button>
        <ul>
          <li>
            <FaHome /> Dashboard
          </li>
          <li>
            <FaUser /> Profile
          </li>
          <li>
            <FaBell /> Notifications
          </li>
          <li>
            <FaComments /> Chat
          </li>
          <li>
            <FaSyncAlt /> Updates
          </li>
          <li>
            <FaQuestionCircle /> Help
          </li>
          <li>
            <FaSignOutAlt /> Logout
          </li>
        </ul>
      </motion.div>

      <div className="navbar">
        <motion.div
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <FaBars onClick={() => setSidebarOpen(true)} />
        </motion.div>
        <div className="nav-right">
          <motion.div whileHover={{ scale: 1.2 }} transition={{ duration: 0.2 }}>
            <FaHome />
          </motion.div>
          <motion.div whileHover={{ scale: 1.2 }} transition={{ duration: 0.2 }}>
            <FaBell />
          </motion.div>
        </div>
      </div>

      <motion.div className="profile-card">
        <div className="profile-picture"></div>
        <h2>{user.full_name}</h2>
        <p>{user.email}</p>
      </motion.div>

      <div className="post-container">
        <AnimatePresence>
          {posts.length > 0 && (
            <motion.div
              key={posts[0].id}
              className="post-card"
              drag="x"
              dragConstraints={{ left: -100, right: 100 }}
              initial={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.9,
                x: posts[0].liked ? 200 : -200,
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="profile-picture"></div>
              <div className="post-content">
                <div className="post-image"></div>
                <p className="post-description">{posts[0].content}</p>
              </div>
              <div className="post-actions">
                <motion.button
                  className="reject-button"
                  onClick={() => handleSwipe(posts[0].id, false)}
                  whileHover={{ scale: 1.3 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaTimes />
                </motion.button>
                <motion.button
                  className="accept-button"
                  onClick={() => handleSwipe(posts[0].id, true)}
                  whileHover={{ scale: 1.3 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaCheck />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bottom-bar">
        <motion.button
          className="create-post-btn"
          whileHover={{ scale: 1.2, rotate: 10 }}
          transition={{ duration: 0.2 }}
        >
          <FaPlus />
        </motion.button>
      </div>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default Dashboard;
