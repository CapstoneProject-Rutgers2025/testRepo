import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      try {
        const decodedToken = jwtDecode(token);
        const userData = {
          full_name: decodedToken.full_name,
          email: decodedToken.email,
        };
        setUser(userData);
      } catch (error) {
        console.error("Invalid token:", error);
        navigate("/login");
      }
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