import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import "./profile.css";

const Profile = () => {
  const [user, setUser] = useState({
    name: "Anaya",
    bio: "Looking to make new friends!",
    profilePic: "https://via.placeholder.com/100",
    friends: [
      { id: 1, name: "Chad", img: "https://via.placeholder.com/50" },
      { id: 2, name: "Avery", img: "https://via.placeholder.com/50" },
      { id: 3, name: "Harry", img: "https://via.placeholder.com/50" },
    ],
    tags: ["Resume Development", "Art", "Baking", "Interior Design"],
    activeGroups: 1,
    inactiveGroups: 3,
  });

  const [showTags, setShowTags] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setUser((prevUser) => ({
        ...prevUser,
        profilePic: "https://mighty.tools/mockmind-api/content/human/125.jpg",
        friends: prevUser.friends.map((friend, index) => ({
          ...friend,
          img: `https://mighty.tools/mockmind-api/content/human/${80 + index}.jpg`,
        })),
      }));
    }, 1000);
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img src={user.profilePic} alt="Profile" className="profile-pic" />
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p>{user.bio}</p>
          <button className="edit-btn">
            <FaEdit /> Edit Profile
          </button>
        </div>
      </div>

      {/* Friends Section */}
      <div className="friends-section">
        <h3>Friends ({user.friends.length})</h3>
        <div className="friends-list">
          {user.friends.map((friend) => (
            <div key={friend.id} className="friend-item">
              <img src={friend.img} alt={friend.name} className="friend-pic" />
              <span>{friend.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tags Section */}
      <div className="tags-section">
        <h3>My Tags:</h3>
        <div className={`tags-grid ${showTags ? "expanded" : ""}`}>
          {user.tags.map((tag, index) => (
            <button key={index} className="tag-btn">
              {tag}
            </button>
          ))}
        </div>
        <button className="toggle-tags-btn" onClick={() => setShowTags(!showTags)}>
          {showTags ? "Show Less" : "Show More"}
        </button>
      </div>

      {/* Groups Section */}
      <div className="groups-section">
        <div className="group-item">
          <span>Active Groups: {user.activeGroups}</span>
          <span className="arrow">▶</span>
        </div>
        <div className="group-item">
          <span>Inactive Groups: {user.inactiveGroups}</span>
          <span className="arrow">▶</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
