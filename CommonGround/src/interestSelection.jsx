import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import './interestSelection.css';
import { jwtDecode } from 'jwt-decode';  // Import jwtDecode

const availableInterests = [
  'Art',
  'Baking',
  'Cooking',
  'Dance',
  'Fashion',
  'Fitness',
  'Gaming',
  'Music',
  'Photography',
  'Reading',
  'Sports',
  'Travel',
];

const InterestSelection = () => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  // Decode the token to get the userId
  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode(token) : null;
  const userId = decodedToken ? decodedToken.id : null;

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

  const handleSubmit = async () => {
    if (selectedInterests.length >= 3) {
      try {
        const response = await fetch('/interests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, interests: selectedInterests }),
        });

        if (response.ok) {
          console.log("Selected Interests:", selectedInterests);
          console.log("Profile Image:", profileImage);

          // Navigate to the dashboard after successful submission
          navigate('/dashboard');
        } else {
          alert('Error saving interests. Please try again.');
        }
      } catch (err) {
        console.error('Error:', err);
        alert('Error saving interests. Please try again.');
      }
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
      <button onClick={handleSubmit} className="submit-button">Submit</button>
    </div>
  );
};

export default InterestSelection;
