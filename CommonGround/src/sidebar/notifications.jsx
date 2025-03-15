import React, { useEffect, useState } from "react";
import "./notif.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("https://your-backend-api.com/notifications");
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="notification-container">
      <h2>Notifications</h2>
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div key={notif.id} className="notification-card">
              <div className="notification-header">
                <div className="avatar">{notif.name.charAt(0)}</div>
                <div>
                  <strong>{notif.name}</strong>
                  <p>{notif.message}</p>
                  <span>{notif.time}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-notifications">No new notifications.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
