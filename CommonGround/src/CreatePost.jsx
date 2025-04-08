import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaPlus } from 'react-icons/fa';
import allInterests from "../interests.js";
import './CreatePost.css';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded = jwtDecode(token);
    const userId = decoded.id;

    fetch(`https://testrepo-hkzu.onrender.com/profile/${userId}`)
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch((err) => console.error('Failed to load profile info', err));

      fetch(`https://testrepo-hkzu.onrender.com/interests/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch interests');
          return res.json();
        })
        .then((data) => {
          setSelectedInterests(data.interests || []);
        })
        .catch((err) => console.error('Failed to load interests:', err));
    }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return setMessage('You must be logged in to post.');

    const decoded = jwtDecode(token);
    const user_id = decoded.id;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('user_id', user_id);
    formData.append('tags', selectedInterests.join(', '));
    if (image) formData.append('image', image);

    try {
      const response = await fetch('https://testrepo-hkzu.onrender.com/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body:(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Post created successfully!');
        setTitle('');
        setContent('');
        setImage(null);
        setSelectedInterests([]);
        setImagePreview(null);
        navigate('/dashboard');
      } else {
        setMessage(result.message || 'Error creating post');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      setMessage('Something went wrong.');
    }
  };

  return (
    <div className="create-post-container">
      <h2 className="title">Create a Post</h2>

      <input
        type="text"
        className="title-input"
        placeholder="Post Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="post-content">
        <label className="image-upload">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="preview-image" />
          ) : (
            <FaPlus className="plus-icon" />
          )}
          <input type="file" hidden onChange={handleImageChange} />
        </label>

        <textarea
          className="description-box"
          placeholder="Description"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="tag-title">Add Tags:</div>
      <div className="tag-selection">
        {allInterests.map((interest, i) => (
          <div
            key={i}
            className={`tag ${selectedInterests.includes(interest) ? 'selected' : ''}`}
            onClick={() => toggleInterest(interest)}
          >
            {interest}
          </div>
        ))}
      </div>

      <button className="create-button" onClick={handleSubmit}>
        Post
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default CreatePost;
