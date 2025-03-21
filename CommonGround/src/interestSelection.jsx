import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import './interestSelection.css';

const interests = [
  "Resume Development", "Movies", "Fashion", "Activism", 
  "Baking", "Books", "Photography", "Cars", 
  "Art", "Parenting", "News"
];

const InterestSelection = () => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();  // Initialize navigate

  const handleInterestClick = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleImageUpload = (event) => {
    if (event.target.files.length > 0) {
      setProfileImage(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleSubmit = () => {
    if (selectedInterests.length >= 3) {
      // Perform any API call or data submission here
      console.log("Selected Interests:", selectedInterests);
      console.log("Profile Image:", profileImage);

      // Navigate to the dashboard after successful submission
      navigate('/dashboard');
    } else {
      alert("Please select at least 3 interests.");
    }
  };

  return (
    <div className="interest-selection">
      <h2>Select 3+ Interests</h2>
      <div className="profile-picture">
        {profileImage ? (
          <img src={profileImage} alt="Profile" />
        ) : (
          <label htmlFor="profile-upload">Add profile picture</label>
        )}
        <input
          id="profile-upload"
          type="file"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
      </div>
      <div className="interests-container">
        {interests.map((interest, index) => (
          <button
            key={index}
            className={`interest ${selectedInterests.includes(interest) ? 'selected' : ''}`}
            onClick={() => handleInterestClick(interest)}
          >
            {interest}
          </button>
        ))}
      </div>
      <button onClick={handleSubmit} className="submit-button">Submit</button>
    </div>
  );
};

export default InterestSelection;
