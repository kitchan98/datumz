import React, { useState } from 'react';
import './PostDataNeed.css';

const PostDataNeed = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    type: 'image', // default to image
    quantity: 1,
    quality: '',
    format: '',
    deliveryMethod: '',
    geographicalScope: '',
    frequency: 'one-time', // default to one-time
    content: '',
    details: '',
    sensitiveDetails: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };

  return (
    <div className="post-data-need">
      <h2>Post Your Data Need</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          required
        ></textarea>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category"
          required
        />
        <input
          type="number"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          placeholder="Budget"
          required
        />
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="Quantity"
          required
        />
        <input
          type="text"
          name="quality"
          value={formData.quality}
          onChange={handleChange}
          placeholder="Quality  (e.g. 250x400, 4K)"
          required
        />
        {formData.type === 'video' && (
          <input
            type="number"
            name="framesPerSecond"
            value={formData.framesPerSecond}
            onChange={handleChange}
            placeholder="Frames per second"
          />
        )}
        <input
          type="text"
          name="format"
          value={formData.format}
          onChange={handleChange}
          placeholder="Format  (e.g. jpg, png, mov)"
          required
        />
        <input
          type="text"
          name="deliveryMethod"
          value={formData.deliveryMethod}
          onChange={handleChange}
          placeholder="Delivery Method"
          required
        />
        <input
          type="text"
          name="geographicalScope"
          value={formData.geographicalScope}
          onChange={handleChange}
          placeholder="Geographical Scope"
          required
        />
        <select
          name="frequency"
          value={formData.frequency}
          onChange={handleChange}
          required
        >
          <option value="one-time">One-time</option>
          <option value="daily">Daily</option>
        </select>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Content of data"
          required
        ></textarea>
        <textarea
          name="details"
          value={formData.details}
          onChange={handleChange}
          placeholder="Details"
          required
        ></textarea>
        <textarea
          name="sensitiveDetails"
          value={formData.sensitiveDetails}
          onChange={handleChange}
          placeholder="Sensitive Details (only seen after confirmed)"
        ></textarea>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default PostDataNeed;
