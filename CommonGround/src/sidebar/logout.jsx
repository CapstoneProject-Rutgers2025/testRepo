import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token"); 
    navigate("/login");
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <h2>Logging out...</h2>
    </div>
  );
};

export default Logout;
