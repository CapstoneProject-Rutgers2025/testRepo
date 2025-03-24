import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import "./CreatePost.css";

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

  const handleSubmit = () => {
    console.log("Post Created:", { text: postText, tags: selectedTags, image });
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
