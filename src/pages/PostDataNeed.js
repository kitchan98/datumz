import React, { useState } from 'react';
import './PostDataNeed.css';

const PostDataNeed = () => {
const [formData, setFormData] = useState({
  description: '',
  category: '',
  budget: '',
  type: 'image',
  quantity: 1,
  quality: '',
  format: '',
  deliveryMethod: '',
  geographicalScope: '',
  frequency: 'one-time',
  details: '',
  sampleFile: null,
});

const handleChange = (e) => {
  const { name, value, type, files } = e.target;
  setFormData(prevData => ({
    ...prevData,
    [name]: type === 'file' ? files[0] : value,
  }));
};

const handleSubmit = (e) => {
  e.preventDefault();
  // Handle form submission logic here
  console.log(formData);
};

return (
  <div className="pdn-container">
    <h2 className="pdn-heading">What Is Your Data Requirement?</h2>
    <form onSubmit={handleSubmit} className="pdn-form">
      <div className="pdn-form-group">
        <label htmlFor="description" className="pdn-label">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your data need"
          required
          className="pdn-textarea"
        ></textarea>
      </div>

      <div className="pdn-form-row">
        <div className="pdn-form-group">
          <label htmlFor="category" className="pdn-label">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Marketing, Research"
            required
            className="pdn-input"
          />
        </div>
        <div className="pdn-form-group">
          <label htmlFor="budget" className="pdn-label">Budget</label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="Enter amount"
            required
            className="pdn-input"
          />
        </div>
      </div>

      <div className="pdn-form-row">
        <div className="pdn-form-group">
          <label htmlFor="type" className="pdn-label">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="pdn-select"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>
        <div className="pdn-form-group">
          <label htmlFor="quantity" className="pdn-label">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Number of items"
            required
            className="pdn-input"
          />
        </div>
      </div>

      <div className="pdn-form-group">
        <label className="pdn-label">Frequency</label>
        <div className="pdn-radio-group">
          {['one-time', 'daily', 'weekly'].map((freq) => (
            <label key={freq} className="pdn-radio-label">
              <input
                type="radio"
                name="frequency"
                value={freq}
                checked={formData.frequency === freq}
                onChange={handleChange}
                required
                className="pdn-radio-input"
              />
              <span className="pdn-radio-custom"></span>
              {freq.charAt(0).toUpperCase() + freq.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="pdn-form-group">
        <label htmlFor="details" className="pdn-label">Details</label>
        <textarea
          id="details"
          name="details"
          value={formData.details}
          onChange={handleChange}
          placeholder="Provide any additional details"
          required
          className="pdn-textarea"
        ></textarea>
      </div>

      <div className="pdn-form-group">
          <label htmlFor="sampleFile" className="pdn-label">Upload Sample {formData.type}</label>
          <input
            type="file"
            id="sampleFile"
            name="sampleFile"
            onChange={handleChange}
            accept={formData.type === 'image' ? 'image/*' : 'video/*'}
            className="pdn-file-input"
          />
          <p className="pdn-file-info">
            {formData.sampleFile ? `Selected file: ${formData.sampleFile.name}` : 'No file selected'}
          </p>
        </div>

      <button type="submit" className="pdn-btn pdn-btn-primary">Submit Data Need</button>
    </form>
  </div>
);
};

export default PostDataNeed;