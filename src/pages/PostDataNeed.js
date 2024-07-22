import React, { useState, useEffect } from 'react';
import './PostDataNeed.css';
import { sendNotificationEmail } from '../services/emailService';

const PostDataNeed = ({ customNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
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

  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    } else {
      // If no user data is found, redirect to login page
      customNavigate('/register-datarequester');
    }
  }, [customNavigate]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    }

    // Add user data to the form data
    if (userData) {
      formDataToSend.append('userData', JSON.stringify(userData));
    }

    fetch('http://localhost:5001/api/form-submit', {
      method: 'POST',
      body: formDataToSend,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(async (data) => {
        console.log('Form data submitted: ', data);
        await sendNotificationEmail('New Data Posted');
        customNavigate('/thank-you-submit');
      })
      .catch((error) => {
        console.error('Form submission error: ', error);
        alert('Error submitting data need');
      });
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
              placeholder="e.g., Biotech, Retail, Finance"
              required
              className="pdn-input"
            />
          </div>
          <div className="pdn-form-group">
            <label htmlFor="budget" className="pdn-label">Budget (£)</label>
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
            {['one-time', 'periodic', 'usage-based'].map((freq) => (
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
          <label htmlFor="sampleFile" className="pdn-label">Upload Sample {formData.type} (Optional)</label>
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

        <div className="submit-button-container">
          <button type="submit" className="pdn-btn pdn-btn-primary">
            Submit Data Need
          </button>
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-content">
                <div className="spinner"></div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default PostDataNeed;