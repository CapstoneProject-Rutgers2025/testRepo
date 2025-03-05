import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login"); 
    } else {
      
      const mockUserData = {
        full_name: "John Doe",
        email: "john.doe@example.com",
      };
      setUser(mockUserData); 
    }
  }, [navigate]);

  return user ? (
    <div>
      <h1>Welcome, {user.full_name}!</h1>
      <p>Your email: {user.email}</p>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default Dashboard;
