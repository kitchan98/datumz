import React, { useState, useEffect } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './PostDataNeed.css';

const PostDataNeed = ({ customNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    budget: '',
    type: 'image',
    quantity: 1,
    frequency: 'one-time',
    details: '',
    sampleFile: null,
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
      setIsLogin(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    const isLocalhost = window.location.hostname === 'localhost';
    const endpoint = isLocalhost
      ? `http://localhost:9999/.netlify/functions/submit-data-need`
      : `/.netlify/functions/submit-data-need`;
  
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (formData[key] && !['name', 'email', 'password'].includes(key)) {
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
  };
  

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    const isLocalhost = window.location.hostname === 'localhost';
    const endpoint = isLocalhost
      ? `http://localhost:9999/.netlify/functions/${isLogin ? 'login' : 'register'}`
      : `/.netlify/functions/${isLogin ? 'login' : 'register'}`;
  
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (isLogin ? 'Failed to login' : 'Failed to register user'));
      }
  
      const userData = await response.json();
      setUserData(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/verify-google-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!response.ok) {
        throw new Error(`Failed to verify Google token: ${response.status} ${response.statusText}`);
      }

      const userData = await response.json();
      setUserData(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      setError('Google sign-in failed. Please try again.');
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleLoginRegister = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  return (

    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
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
            {userData ? (
              <p>Logged in as: {userData.name} ({userData.email})</p>
            ) : (
              <>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in failed. Please try again.')}
                />
                <div className="pdn-divider">Or</div>
                {!isLogin && (
                  <div className="pdn-form-group">
                    <label htmlFor="name" className="pdn-label">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pdn-input"
                      required={!isLogin}
                    />
                  </div>
                )}
                <div className="pdn-form-group">
                  <label htmlFor="email" className="pdn-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pdn-input"
                    required
                  />
                </div>
                <div className="pdn-form-group">
                  <label htmlFor="password" className="pdn-label">Password</label>
                  <div className="pdn-password-input">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pdn-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="pdn-password-toggle"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleLoginRegister}
                  className="pdn-btn pdn-btn-secondary"
                >
                  {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                </button>
                <button
                  type="button"
                  onClick={handleAuthSubmit}
                  className="pdn-btn pdn-btn-primary1"
                  disabled={isLoading}
                >
                  {isLogin ? 'Login' : 'Register'}
                </button>
              </>
            )}
          </div>

          {error && <div className="pdn-error-message">{error}</div>}

          <button
            type="submit"
            className="pdn-btn pdn-btn-primary2"
            disabled={isLoading || !userData}
          >
            {isLoading ? 'Submitting...' : 'Submit Data Need'}
          </button>
        </form>
      </div>
    </GoogleOAuthProvider>
  );
};

export default PostDataNeed;