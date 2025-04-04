import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import "./profile.css";
import { useParams } from "react-router-dom";

const Profile = () => {
  const { userId } = useParams(); // Get userId from the route params
  const [user, setUser] = useState({
    name: "Unknown User",
    bio: "No bio available",
    profilePic: "https://via.placeholder.com/100",
    tags: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Fetch user profile data from the backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('https://testrepo-hkzu.onrender.com/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the token
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched profile data:", data);
          setUser({
            name: data.name || "Unknown User",
            bio: data.bio || "No bio available",
            profilePic: data.profile_picture
              ? `https://testrepo-hkzu.onrender.com${data.profile_picture}`
              : "https://via.placeholder.com/100",
            tags: data.tags || [],
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

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch(`https://testrepo-hkzu.onrender.com/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio: user.bio,
          tags: user.tags, // send as an array
        }),
      });

      if (response.ok) {
        showMessage("success", "Profile updated successfully!");
        setIsEditing(false);
      } else {
        showMessage("error", "Error updating profile.");
      }
    } catch (err) {
      console.error("Error:", err);
      showMessage("error", "Something went wrong.");
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-pic-container">
          <img src={user.profilePic} alt="Profile" className="profile-pic" />
        </div>
        <h2 className="profile-username">{user.name}</h2>

        <div className="profile-info">
          {isEditing ? (
            <textarea
              value={user.bio}
              onChange={(e) => setUser({ ...user, bio: e.target.value })}
              className="profile-bio-input"
              placeholder="Write a short bio..."
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

      {/* Tags Section */}
      <div className="tags-section">
        <h3>My Tags:</h3>
        <div className={`tags-grid ${showTags ? "expanded" : ""}`}>
          {user.tags.map((tag, index) => (
            <button
              key={index}
              className="tag-btn"
              onClick={() =>
                isEditing
                  ? setUser({ ...user, tags: user.tags.filter((t) => t !== tag) })
                  : null
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
                setUser({ ...user, tags: [...user.tags, e.target.value.trim()] });
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

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default Profile;
