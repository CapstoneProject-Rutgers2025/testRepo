import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import "./profile.css";
import { useParams } from "react-router-dom";

const Profile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
      const fetchProfile = async () => {
          try {
              const response = await fetch(`/profile/${userId}`);
              if (response.ok) {
                  const data = await response.json();
                  setProfile(data);
              } else {
                  console.error('Error fetching profile');
              }
          } catch (err) {
              console.error('Error:', err);
          }
      };

      fetchProfile();
  }, [userId]);

  return profile ? (
      <div>
          <h1>{profile.description}</h1>
          <img src={profile.profile_picture} alt="Profile" />
      </div>
  ) : (
      <p>Loading...</p>
  );
};

export default Profile;
