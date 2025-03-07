import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);

    if (!token) {
      navigate("/login");
    } else {
      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded token:", decodedToken);
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

  return userData ? (
    <div>
      <h1>Welcome, {userData.full_name}!</h1>
      <p>Your email: {userData.email}</p>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default Dashboard;