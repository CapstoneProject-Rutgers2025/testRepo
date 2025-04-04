import React, { useState } from "react";
import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Login from "./login";
import SignUp from "./signup";
import Dashboard from "./dashboard";
import HomeScreen from "./homescreen";
import InterestSelection from "./interestSelection"; 
import CreatePost from "./CreatePost";


import Profile from "./sidebar/profile";
import Notifications from "./sidebar/notifications";
import Chat from "./sidebar/chat";
import Updates from "./sidebar/updates";
import Help from "./sidebar/help";
import Sidebar from "./sidebar/side";
import Navbar from "./navbar";


function Layout({ children, isSidebarOpen, toggleSidebar }) {
  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Navbar toggleSidebar={toggleSidebar} />
        {children}
      </div>
    </div>
  );
}

function AnimatedRoutes({ isSidebarOpen, toggleSidebar }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/interests" element={<InterestSelection onSubmit={(data) => console.log(data)} />} />

        {/* Dashboard and Sidebar Pages */}
        <Route path="/dashboard" element={<Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><Dashboard /></Layout>} />
        <Route path="/profile" element={<Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><Profile /></Layout>} />
        <Route path="/profile/:userId" element={<Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><Profile /></Layout>} />
        <Route path="/notifications" element={<Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><Notifications /></Layout>} />
        <Route path="/chat" element={<Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><Chat /></Layout>} />
        <Route path="/updates" element={<Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><Updates /></Layout>} />
        <Route path="/help" element={<Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><Help /></Layout>} />
        <Route path="/create-post" element={<Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><CreatePost /></Layout>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const hideSidebarRoutes = ["/login", "/signup", "/interests"];
  const shouldShowSidebar = !hideSidebarRoutes.includes(location.pathname);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="app-container">
      {shouldShowSidebar && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
      <AnimatedRoutes isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
