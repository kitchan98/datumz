import React, { useState, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './PostDataNeed.css';
import Auth from '../components/Auth'; // Ensure this path is correct

const PostDataNeed = ({ customNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [authSuccessful, setAuthSuccessful] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    budget: '',
    type: 'image',
    quantity: 1,
    frequency: 'one-time',
    details: '',
    sampleFile: null,
  });
  const [error, setError] = useState(null);

  // Load user data on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!userData) {
      setError('Please log in or register to submit a data need.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const isLocalhost = window.location.hostname === 'localhost';
    const endpoint = isLocalhost
      ? `http://localhost:9999/.netlify/functions/submit-data-need`
      : `/.netlify/functions/submit-data-need`;

    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      }
      formDataToSend.append('userData', JSON.stringify(userData));

      const dataNeedResponse = await fetch(endpoint, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!dataNeedResponse.ok) {
        throw new Error('Network response was not ok ' + dataNeedResponse.statusText);
      }

      const data = await dataNeedResponse.json();
      console.log('Form data submitted: ', data);

      await fetch('/.netlify/functions/send-notification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Thank You for Your Submission',
          email: userData.email,
          name: userData.name,
        }),
      });

      customNavigate('/thank-you-submit');
    } catch (error) {
      console.error('Form submission error: ', error);
      setError(error.message || 'Error submitting data need');
    } finally {
      setIsLoading(false);
    }
  }, [userData, formData, customNavigate]);

  // Handle automatic form submission after successful authentication
  useEffect(() => {
    if (authSuccessful && userData) {
      handleSubmit(new Event('submit'));
      setAuthSuccessful(false);
    }
  }, [authSuccessful, userData, handleSubmit]);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="pdn-container">
        <h2 className="pdn-heading">What Is Your Data Requirement?</h2>
        <div className="pdn-form">
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

          <div className="pdn-auth-section">
            <h3>Account Information</h3>
            <Auth
              userData={userData}
              setUserData={(user) => {
                setUserData(user);
                localStorage.setItem('user', JSON.stringify(user));
                setAuthSuccessful(true);
              }}
              onAuthSuccess={(user) => {
                setUserData(user);
                localStorage.setItem('user', JSON.stringify(user));
                setAuthSuccessful(true);
              }}
            />
          </div>

          {error && <div className="pdn-error-message">{error}</div>}

          <div className="pdn-hint">
            <p>Please fill out the form above and register/login before submitting your data need.</p>
          </div>

          <button
            onClick={handleSubmit}
            className="pdn-btn pdn-btn-primary2"
            disabled={isLoading || !userData}
          >
            {isLoading ? 'Submitting...' : 'Submit Data Need'}
          </button>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default PostDataNeed;