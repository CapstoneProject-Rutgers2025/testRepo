import React, { useEffect, useState } from "react";
import "./updates.css";

const Updates = () => {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetch("https://your-backend-api.com/updates");
        const data = await response.json();
        setUpdates(data);
      } catch (error) {
        console.error("Error fetching updates:", error);
      }
    };

    fetchUpdates();
  }, []);

  return (
    <div className="updates-container">
      <h2>Latest Updates</h2>
      <div className="updates-list">
        {updates.length > 0 ? (
          updates.map((update) => (
            <div key={update.id} className="update-card">
              <h3>{update.title}</h3>
              <p>{update.description}</p>
              <span>{update.date}</span>
            </div>
          ))
        ) : (
          <p className="no-updates">No new updates available.</p>
        )}
      </div>
    </div>
  );
};

export default Updates;
