import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import "./CreatePost.css";
import {jwtDecode} from "jwt-decode";

const CreatePost = () => {
  const [postText, setPostText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const storedInterests = JSON.parse(localStorage.getItem("selectedInterests")) || [];
    setTags(storedInterests);
  }, []);

  const handleTagClick = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag) ? prevTags.filter((t) => t !== tag) : [...prevTags, tag]
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      console.error("User not authenticated");
      alert("Please log in first.");
      return;
    }
  
    try {
      // Decode the JWT token to get the user ID
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id; 
      console.log("Decoded Token:", decodedToken);
      console.log("User ID:", userId);
  
  
      // Prepare the post data with the dynamically retrieved user_id
      const postData = {
        title: "Untitled Post",
        content: postText,
        image_url: image, 
        user_id: userId, 
        tags: selectedTags,
      };
  
      // Send the POST request to create the post
      const response = await fetch("https://testrepo-hkzu.onrender.com/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify(postData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to create post: ${errortext}");
      }
  
      const data = await response.json();
      console.log("Post Created:", data);
      alert("Post successfully created!");
  
      // Reset form after submission
      setPostText("");
      setSelectedTags([]);
      setImage(null);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error creating post:", error.message); 
        alert(`Error creating post. Please try again. ${error.message}`);
      } else {
        console.error("Unexpected error:", error);
        alert("Unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="create-post-container">
      <h2 className="title">Create Post</h2>
      <div className="post-content">
        <label className="image-upload">
          {image ? (
            <img src={image} alt="Uploaded" className="preview-image" />
          ) : (
            <div className="plus-icon">+</div>
          )}
          <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
        </label>
        <textarea
          className="description-box"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="Description..."
        ></textarea>
      </div>
      <p className="tag-title">Choose tag most relevant to your post</p>
      <div className="tag-selection">
        {tags.map((tag) => (
          <button
            key={tag}
            className={selectedTags.includes(tag) ? "tag selected" : "tag"}
            onClick={() => handleTagClick(tag)}
          >
            {selectedTags.includes(tag) ? "✔ " : "+ "}{tag}
          </button>
        ))}
      </div>
      <button className="create-button" onClick={handleSubmit}>Create</button>
    </div>
  );
};

export default CreatePost;
