import React, { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

const Auth = ({ userData, setUserData, onAuthSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
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
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (isLogin ? 'Failed to login' : 'Failed to register user'));
      }
  
      const userData = await response.json();
      setUserData(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      onAuthSuccess(userData, true);
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/.netlify/functions/verify-google-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to verify Google token: ${response.status} ${response.statusText}. ${errorData.message || ''}`);
      }
  
      const userData = await response.json();
      setUserData(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      onAuthSuccess(userData);
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      setError('Google sign-in failed. Please try again later or use email login.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleLoginRegister = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  const handleLogout = () => {
    setUserData(null);
    localStorage.removeItem('user');
  };

  if (userData) {
    return (
      <div className="auth-logged-in">
        <p>Logged in as: {userData.name} ({userData.email})</p>
        <button onClick={handleLogout} className="auth-logout-btn">Logout</button>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="auth-container">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google sign-in failed. Please try again.')}
        />
        <div className="auth-divider">Or</div>
        <form onSubmit={handleAuthSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-form-group">
              <label htmlFor="name" className="auth-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="auth-input"
                required={!isLogin}
              />
            </div>
          )}
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="password" className="auth-label">Password</label>
            <div className="auth-password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="auth-input"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="auth-password-toggle"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          {error && <div className="auth-error-message">{error}</div>}
          <button
            type="submit"
            className="auth-btn auth-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        <button
          type="button"
          onClick={toggleLoginRegister}
          className="auth-btn auth-btn-secondary"
        >
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Auth;