import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence} from "framer-motion";
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
             dragConstraints={{ left: 0, right: 0 }}
             dragElastic={1.2} //  Looseness 
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
               const velocity = info.velocity.x;
           
               
               const swipeThreshold = 250;//how far to go 
           
               if (offset > swipeThreshold) {
                 handleSwipe(posts[0].id, true); 
               } else if (offset < -swipeThreshold) {
                 handleSwipe(posts[0].id, false); 
               }
             }}
           >
           
            
              {/* Profile Picture */}
              <div className="profile-picture"></div>
            
              {/* Post Image */}
              <div className="post-image"></div>
            
              {/* Post Description */}
              <p className="post-description">{posts[0].content}</p>
            
              
              
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
