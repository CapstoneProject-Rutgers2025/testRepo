import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import './interestSelection.css';

const availableInterests = [
  'Art', 'Baking', 'Cooking', 'Dance', 'Fashion', 'Fitness',
  'Gaming', 'Music', 'Photography', 'Reading', 'Sports', 'Travel'
];

const InterestSelection = () => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.id);
      fetchExistingProfile(decodedToken.id);
    } else {
      alert('Please log in first.');
      navigate('/login');
    }
  }, [navigate]);

  const fetchExistingProfile = async (id) => {
    try {
      const res = await fetch(`https://testrepo-hkzu.onrender.com/profile/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.profile_picture) {
        setProfileImage(`https://testrepo-hkzu.onrender.com${data.profile_picture}`);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleInterestClick = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(item => item !== interest)
        : [...prev, interest]
    );
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImage(URL.createObjectURL(file)); // Show preview

    try {
      const formData = new FormData();
      // Update only the profile picture and bio (if any)
      formData.append("profile_picture", file);
      formData.append("bio", ""); // optional for now

      const response = await fetch(`https://testrepo-hkzu.onrender.com/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload profile picture.");

      showMessage("success", "Profile picture uploaded successfully!");
    } catch (err) {
      console.error("Error:", err);
      showMessage("error", "Error uploading profile picture.");
    }
  };

  const saveInterests = async () => {
    if (selectedInterests.length < 3) {
      showMessage("error", "Please select at least 3 interests.");
      return;
    }

    try {
      const response = await fetch(`https://testrepo-hkzu.onrender.com/interests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId, interests: selectedInterests }),
      });

      if (!response.ok) throw new Error("Failed to save interests.");

      showMessage("success", "Interests saved successfully!");
      // Delay navigation to give time to read the success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      console.error("Error:", err);
      showMessage("error", "Error saving interests.");
    }
  };

  return (
    <div className="interest-selection">
      <div className="card">
        <h2>Select 3+ Interests</h2>

        <label className="profile-picture" htmlFor="profile-upload">
          {profileImage ? (
            <img src={profileImage} alt="Profile" />
          ) : (
            <span className="upload-label">Add profile picture</span>
          )}
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </label>

        <div className="interests-container">
          {availableInterests.map((interest, index) => (
            <button
              key={index}
              className={`interest ${selectedInterests.includes(interest) ? 'selected' : ''}`}
              onClick={() => handleInterestClick(interest)}
            >
              {interest}
            </button>
          ))}
        </div>

        <button onClick={saveInterests} className="submit-button">
          Save Interests
        </button>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestSelection;
