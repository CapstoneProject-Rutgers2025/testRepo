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
  const [imageFile, setImageFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.id);
    } else {
      alert('Please log in first.');
      navigate('/login');
    }
  }, [navigate]);

  const handleInterestClick = (interest) => {
    setSelectedInterests(prevInterests =>
      prevInterests.includes(interest)
        ? prevInterests.filter(item => item !== interest)
        : [...prevInterests, interest]
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const uploadProfilePicture = async () => {
    if (!imageFile) {
      alert("Please upload a profile picture.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profile_picture', imageFile);

      const response = await fetch(`https://testrepo-hkzu.onrender.com/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload profile picture.");
      }

      alert("Profile picture uploaded successfully!");
    } catch (err) {
      console.error("Error:", err);
      alert("Error uploading profile picture.");
    }
  };

  const saveInterests = async () => {
    if (selectedInterests.length < 3) {
      alert("Please select at least 3 interests.");
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

      if (!response.ok) {
        throw new Error("Failed to save interests.");
      }

      alert("Interests saved successfully!");
      navigate('/dashboard');
    } catch (err) {
      console.error("Error:", err);
      alert("Error saving interests.");
    }
  };

  return (
    <div className="interest-selection">
      <h2>Select 3+ Interests</h2>

      <div className="profile-picture">
        {profileImage ? (
          <img src={profileImage} alt="Profile" />
        ) : (
          <label htmlFor="profile-upload" className="upload-label">
            Add profile picture
          </label>
        )}
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
      </div>

      <button onClick={uploadProfilePicture} className="submit-button">
        Upload Profile Picture
      </button>

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
    </div>
  );
};

export default InterestSelection;
