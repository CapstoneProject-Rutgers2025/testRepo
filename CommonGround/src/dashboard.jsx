//dashboard
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import Sidebar from "./sidebar/side";
import "./dashboard.css";
import socket from "./socket"; 

const BASE_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_RENDER_URL || "https://testrepo-hkzu.onrender.com"
    : import.meta.env.VITE_LOCAL_URL || "http://localhost:3000";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState([]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      try {
        const decodedToken = jwtDecode(token);
        setUser({
          id: decodedToken.id, // Added user ID for chat functionality
          full_name: decodedToken.full_name,
          email: decodedToken.email,
        });
        
        // Connect to WebSocket and listen for events
        socket.emit("joinDashboard", decodedToken.id); // Example event
        socket.on("dashboardUpdate", (data) => {
          console.log("Dashboard update received:", data);
        });

        // Cleanup WebSocket connection on unmount
        return () => {
          socket.emit("leaveDashboard", decodedToken.id); // Example event
          socket.off("dashboardUpdate");
        };

      } catch (error) {
        console.error("Invalid token:", error);
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/posts`);
        if (!response.ok) {
          throw new Error(`Error fetching posts: ${response.statusText}`);
        }
        const data = await response.json();
        const formatted = data.map((post) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          image_url: post.image_url,
          user_name: post.user_name,
          chat_id: post.chat_id, 
          liked: null,
        }));
        setPosts(formatted);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    fetchPosts();
  }, []);

  const handleSwipe = async (id, liked) => {
    setPosts((prev) => prev.filter((post) => post.id !== id)); // Remove the post from the feed

    if (liked) {
      try {
        const post = posts.find((post) => post.id === id);
        if (!post || !post.chat_id || !user) return;

        // Add the user to the chat associated with the post
        const response = await fetch(`${BASE_URL}/chat-users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: post.chat_id,
            user_id: user.id,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to join chat: ${response.statusText}`);
        }

        console.log(`User ${user.id} added to chat ${post.chat_id}`);
      } catch (err) {
        console.error("Error joining chat:", err);
      }
    }
  };

  return user ? (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`dashboard-content ${sidebarOpen ? "shift" : ""}`}>
        <div className="post-container">
          <AnimatePresence>
            {posts.length > 0 && (
              <motion.div
                key={posts[0].id}
                className="post-card"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1.2}
                whileDrag={{ rotate: 5, scale: 1.03 }}
                initial={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  x: posts[0].liked === true ? 500 : posts[0].liked === false ? -500 : 0,
                  rotate: 0,
                  transition: { duration: 0.3 },
                }}
                onDragEnd={(e, info) => {
                  const offset = info.offset.x;
                  const swipeThreshold = 250;
                  if (offset > swipeThreshold) {
                    handleSwipe(posts[0].id, true); // Swipe right
                  } else if (offset < -swipeThreshold) {
                    handleSwipe(posts[0].id, false); // Swipe left
                  }
                }}
              >
                {/* 📝 Title */}
                <h3 className="post-title">{posts[0].title}</h3>

                {/* 🖼️ Image */}
                {posts[0].image_url && (
                  <div className="post-image">
                    <img src={posts[0].image_url} alt="Post" />
                  </div>
                )}

                {/* 👤 Username */}
                <div className="poster-name">@{posts[0].user_name}</div>

                {/* ✍️ Description */}
                <p className="post-description">{posts[0].content}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bottom-bar">
          <motion.button
            className="create-post-btn"
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate("/create-post")}
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