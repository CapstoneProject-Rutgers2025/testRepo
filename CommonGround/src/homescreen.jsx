import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./hs.css";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";

const HomeScreen = () => {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [boards] = useState([
    { id: 1, title: "Find Your People", description: "Swipe & start chatting instantly." },
    { id: 2, title: "Casual or Deep?", description: "Join conversations that matter to you." },
    { id: 3, title: "Start Something New", description: "Create a discussion & invite others." },
  ]);

  const handleSignUp = () => navigate("/signup");
  const handleSignIn = () => navigate("/login");

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="logo">CommonGround</div>
        <div className="nav-buttons">
          {!isSignedIn ? (
            <>
              <button className="nav-btn" onClick={handleSignIn}>
                <FaSignInAlt /> Sign In
              </button>
              <button className="nav-btn dark-btn" onClick={handleSignUp}>
                <FaUserPlus /> Sign Up Free
              </button>
            </>
          ) : (
            <p>Welcome back!</p>
          )}
        </div>
      </nav>

      <header className="hero-section">
        <h1>Swipe. Connect. Chat.</h1>
        <p>Join instant conversations on topics that matter to you.</p>
      </header>

      <section className="collaboration-visuals">
        <h2>See Collaboration in Action</h2>
        <div className="visuals-container">
          <div className="visual-box">📌 Need Advice? Get Instant Feedback.</div>
          <div className="visual-box">💡 Swipe Right to Start Talking.</div>
          <div className="visual-box">📊 Turn Ideas into Conversations.</div>
        </div>
      </section>

      <div className="boards-preview">
        <h2>Preview Conversations</h2>
        <div className="board-grid">
          {boards.map((board) => (
            <div className="board-card" key={board.id}>
              <h3>{board.title}</h3>
              <p>{board.description}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="footer">
        <p>© 2025 CommonGround. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default HomeScreen;
