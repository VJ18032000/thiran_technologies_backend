import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createPost, updatePost } from '../redux/postsSlice';

const PostForm = ({ postToEdit, onFormSubmit }) => {
  const dispatch = useDispatch();

  // State hooks
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // State for image preview

  // Update form state when postToEdit changes (for editing posts)
  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title);
      setText(postToEdit.text);
      setImage(null); // Reset image when editing a post (allowing user to select a new one)
      setImagePreview(null); // Reset image preview when editing
    } else {
      // Clear state when creating a new post
      setTitle('');
      setText('');
      setImage(null);
      setImagePreview(null);
    }
  }, [postToEdit]); // Re-run the effect when postToEdit changes

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0]; // Get the selected file
    if (selectedImage) {
      setImage(selectedImage); // Set the file state
      setImagePreview(URL.createObjectURL(selectedImage)); // Create an image URL for preview
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('text', text);
    if (image) formData.append('image', image); // Add the image file if selected

    if (postToEdit) {
      // Dispatch the update action and reset form state after successful submission
      dispatch(updatePost({ id: postToEdit.id, postData: formData })).then(() => {
        // Reset form after successful submission
        setTitle('');
        setText('');
        setImage(null);
        setImagePreview(null);

        // Optionally, call onFormSubmit to refresh data in parent component (if necessary)
        if (onFormSubmit) onFormSubmit();
      });
    } else {
      // Dispatch the create action and reset form state after successful submission
      dispatch(createPost(formData)).then(() => {
        // Reset form after successful submission
        setTitle('');
        setText('');
        setImage(null);
        setImagePreview(null);

        // Optionally, call onFormSubmit to refresh data in parent component (if necessary)
        if (onFormSubmit) onFormSubmit();
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{postToEdit ? 'Edit Post' : 'Create Post'}</h2>
      
      {/* Input fields for title and text */}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      ></textarea>

      {/* Show current image if editing */}
      {postToEdit && postToEdit.image && !imagePreview && (
        <div>
          <img
            src={postToEdit.image}
            alt="Current Post"
            style={{ width: '150px', marginBottom: '10px' }}
          />
        </div>
      )}

      {/* Show preview of the new image if selected */}
      {imagePreview && (
        <div>
          <img
            src={imagePreview}
            alt="New Post Preview"
            style={{ width: '150px', marginBottom: '10px' }}
          />
        </div>
      )}

      {/* File input for image selection */}
      <input type="file" onChange={handleImageChange} />

      {/* Submit button */}
      <button type="submit">{postToEdit ? 'Update Post' : 'Create Post'}</button>
    </form>
  );
};

export default PostForm;
