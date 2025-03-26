import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import "./profile.css";
import { useParams } from "react-router-dom";

const Profile = () => {
  const { userId } = useParams(); // Get userId from the route params
  const [user, setUser] = useState({
    name: "User",
    bio: "No bio available",
    profilePic: "https://via.placeholder.com/100",
    friends: [],
    tags: [],
    activeGroups: 0,
    inactiveGroups: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await fetch(`/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser({
          name: data.name || "User",
          bio: data.bio || "No bio available",
          profilePic: data.profile_picture || "https://via.placeholder.com/100",
          friends: [],
          tags: data.tags || [],
          activeGroups: data.active_groups || 0,
          inactiveGroups: data.inactive_groups || 0,
        });
      } else {
        console.error("Error fetching profile:", response.statusText);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  fetchProfile();
}, [userId]);

if (isLoading) {
  return <p>Loading...</p>;
}


  // Handle profile updates
  const handleProfileUpdate = async () => {
    try {
      const response = await fetch(`/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profilePicture: user.profilePic,
          bio: user.bio,
          tags: user.tags,
          activeGroups: user.activeGroups,
          inactiveGroups: user.inactiveGroups,
        }),
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        setIsEditing(false);
      } else {
        alert("Error updating profile");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Handle profile picture upload
  const handleImageUpload = (event) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-pic-container">
          <img src={user.profilePic} alt="Profile" className="profile-pic" />
          {isEditing && (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="profile-pic-upload"
            />
          )}
        </div>
        <div className="profile-info">
          {isEditing ? (
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="profile-name-input"
            />
          ) : (
            <h2>{user.name}</h2>
          )}
          {isEditing ? (
            <textarea
              value={user.bio}
              onChange={(e) => setUser({ ...user, bio: e.target.value })}
              className="profile-bio-input"
            />
          ) : (
            <p>{user.bio}</p>
          )}
          <button
            className="edit-btn"
            onClick={() => {
              if (isEditing) {
                handleProfileUpdate();
              } else {
                setIsEditing(true);
              }
            }}
          >
            <FaEdit /> {isEditing ? "Save Profile" : "Edit Profile"}
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
            <button
              key={index}
              className="tag-btn"
              onClick={() =>
                setUser({
                  ...user,
                  tags: user.tags.filter((t) => t !== tag),
                })
              }
            >
              {tag} {isEditing && "✖"}
            </button>
          ))}
        </div>
        {isEditing && (
          <input
            type="text"
            placeholder="Add a tag"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim() !== "") {
                setUser({
                  ...user,
                  tags: [...user.tags, e.target.value.trim()],
                });
                e.target.value = "";
              }
            }}
            className="add-tag-input"
          />
        )}
        <button
          className="toggle-tags-btn"
          onClick={() => setShowTags(!showTags)}
        >
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