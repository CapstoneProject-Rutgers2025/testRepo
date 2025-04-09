//dashboard
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import Sidebar from "./sidebar/side";
import "./dashboard.css";

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
          full_name: decodedToken.full_name,
          email: decodedToken.email,
        });
      } catch (error) {
        console.error("Invalid token:", error);
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("https://testrepo-hkzu.onrender.com/posts");
        const data = await response.json();
        const formatted = data.map((post) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          image_url: post.image_url,
          user_name: post.user_name,
          liked: null,
        }));
        setPosts(formatted);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    fetchPosts();
  }, []);

  const handleSwipe = (id, liked) => {
    setPosts((prev) => {
      const swipedPost = prev.find((post) => post.id === id);
      if (!swipedPost) return prev;

      const updatedPosts = prev.map((post) =>
        post.id === id ? { ...post, liked } : post
      );

      setTimeout(() => {
        setPosts((currentPosts) => {
          const remaining = currentPosts.filter((post) => post.id !== id);
          return [...remaining, swipedPost];
        });
      }, 300);

      return updatedPosts;
    });
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
                    handleSwipe(posts[0].id, true);
                  } else if (offset < -swipeThreshold) {
                    handleSwipe(posts[0].id, false);
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

