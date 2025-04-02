import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
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

  const handleImageUpload = (event) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);  // Preview image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (selectedInterests.length < 3) {
      alert("Please select at least 3 interests.");
      return;
    }

    try {
      let profilePictureUrl = null;

      // Step 1: Upload Profile Picture (if any)
      if (imageFile) {
        const formData = new FormData();
        formData.append("profilePicture", imageFile);
        formData.append("userId", userId);

        const uploadResponse = await fetch('https://testrepo-hkzu.onrender.com/upload', {
          method: 'POST',
          body: formData,
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok) {
          profilePictureUrl = uploadData.imageUrl;  // URL returned from backend
        } else {
          alert("Image upload failed.");
          return;
        }
      }

      // Step 2: Update User Profile with image URL
      const profileResponse = await fetch(`https://testrepo-hkzu.onrender.com/profile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ userId, profilePicture: profilePictureUrl })
      });

      if (!profileResponse.ok) {
        alert('Error saving profile.');
        return;
      }

      // Step 3: Store User Interests in Database
      const interestsResponse = await fetch(`https://testrepo-hkzu.onrender.com/interests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ 
          userId: userId || decodedToken.email,  // Fallback to email if userId is missing
          interests: selectedInterests 
        })
      });

      if (interestsResponse.ok) {
        navigate('/dashboard');
      } else {
        const errorMessage = await interestsResponse.text(); // Get error message
        alert('Error saving interests: ' + errorMessage);
      }
    } catch (err) {
      console.error("Interest Save Error:", err);
      alert('Error saving profile and interests.');
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
