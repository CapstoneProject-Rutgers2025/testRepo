import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTimes, FaCheck } from "react-icons/fa";
import Sidebar from "./sidebar/side"; 
import "./dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState([
    { id: 1, content: "🚀 Description!", liked: null },
    { id: 2, content: "🔥 Description!", liked: null },
  ]);

  // ✅ Toggle Sidebar
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // ✅ Authentication Check
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
        console.error("Invalid token:", error);
        navigate("/login");
      }
    }
  }, [navigate]);

  // ✅ Handle Swipe (X or ✔)
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
      {/* ✅ Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* ✅ Main Content */}
      <div className={`dashboard-content ${sidebarOpen ? "shift" : ""}`}>

        {/* ✅ User Profile */}
        <motion.div className="profile-card">
          <div className="profile-picture"></div>
          <h2>{user.full_name}</h2>
          <p>{user.email}</p>
        </motion.div>

        {/* ✅ Posts Section */}
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
              {/* Profile Picture */}
              <div className="profile-picture"></div>
            
              {/* Post Image */}
              <div className="post-image"></div>
            
              {/* Post Description */}
              <p className="post-description">{posts[0].content}</p>
            
              {/* Accept & Reject Buttons */}
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

        {/* ✅ Bottom Bar (Centered) */}
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
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default Dashboard;
