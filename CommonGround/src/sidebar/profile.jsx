import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./profile.css";
import allInterests from "../../interests.js";


const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      fetchProfile(userId);
    } catch (err) {
      console.error("Token decode failed, navigating to login");
      navigate("/login");
    }
  }, [navigate]);

  const fetchProfile = async (userId) => {
    try {
      const response = await fetch(`https://testrepo-hkzu.onrender.com/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Error fetching profile");

      const data = await response.json();
      setUser({
        id: data.user_id,
        username: data.username || "",
        displayName: data.name || "",
        profilePic: data.profile_picture,
        bio: data.bio || "No bio available",
        tags: Array.isArray(data.tags) ? data.tags : [],
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
      setMessage("Could not load profile.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImageFile(file);
    setUser({ ...user, profilePic: URL.createObjectURL(file) });
  };

  const handleProfileUpdate = async () => {
    try {
      const formData = new FormData();
      if (profileImageFile) {
        formData.append("profile_picture", profileImageFile);
      }
      formData.append("bio", user.bio);
      formData.append("name", user.displayName); // ✅ editable name
      console.log("🚀 Sending tags:", user.tags);
      formData.append("interests", JSON.stringify(user.tags));
      

      const response = await fetch(`https://testrepo-hkzu.onrender.com/profile/${user.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Update failed");

      setIsEditing(false);
      setMessage("Profile updated!");
      fetchProfile(user.id);
    } catch (err) {
      console.error("❌ Error updating profile:", err);
    
      // Try to read the full error text from the response
      console.log("📨 Server responded with raw error:", err.message);
      setMessage("Error updating profile");
    }
    
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <div className="profile-header"></div>
  
      <div className="profile-img-wrapper">
        <label className="profile-pic-upload-label">
        <img
          src={user.profilePic?.startsWith("http") ? user.profilePic : `https://testrepo-hkzu.onrender.com${user.profilePic}`}
          alt="Profile"
          className="profile-pic"
          />

          {isEditing && (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="profile-pic-upload"
            />
          )}
        </label>
      </div>
  
      <div className="profile-main">
        {isEditing ? (
          <input
            type="text"
            value={user.displayName}
            onChange={(e) =>
              setUser({ ...user, displayName: e.target.value })
            }
            className="display-name-input"
            placeholder="Display Name"
          />
        ) : (
          <h2 className="profile-name">{user.displayName || user.username}</h2>
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
          <FaEdit /> {isEditing ? "Save" : "Edit Profile"}
        </button>
  
        <div className="tags-box">
          <h4>Interested Topics</h4>
          <div className="tags-grid">
            {user.tags.map((tag, index) => (
              <span
                key={index}
                className="tag-btn"
                onClick={() => {
                  if (isEditing) {
                    setUser({
                      ...user,
                      tags: user.tags.filter((t) => t !== tag),
                    });
                  }
                }}
              >
                {tag} {isEditing && "✖"}
              </span>
            ))}
          </div>
          {isEditing && (
            <select
              onChange={(e) => {
                const selectedTag = e.target.value;
                if (
                  selectedTag &&
                  !user.tags.includes(selectedTag)
                ) {
                  setUser({
                    ...user,
                    tags: [...user.tags, selectedTag],
                  });
                }
              }}
              className="add-tag-input"
              defaultValue=""
            >
              <option value="" disabled>
                Select a tag
              </option>
              {allInterests.map((interest, index) => (
                <option key={index} value={interest}>
                  {interest}
                </option>
              ))}
            </select>
          )}
        </div>
  
        <div className="bio-box">
          <h4>Bio</h4>
          {isEditing ? (
            <textarea
              value={user.bio}
              onChange={(e) =>
                setUser({ ...user, bio: e.target.value })
              }
              className="profile-bio-input"
            />
          ) : (
            <p>{user.bio}</p>
          )}
        </div>
  
        {message && <p className="update-message">{message}</p>}
      </div>
    </div>
  );
};

export default Profile;
