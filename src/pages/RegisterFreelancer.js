import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { FaFacebook, FaLinkedin, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
import { sendNotificationEmail } from '../services/emailService';
import './RegisterFreelancer.css';

const RegisterFreelancer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegistration = async (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      await sendNotificationEmail('New User Registration (Freelancer)', userData.email, userData.name);
      navigate('/thank-you-register');
    } catch (error) {
      console.error('Error during registration process:', error);
      setError('An error occurred during registration. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const endpoint = isLogin ? '/api/login' : '/api/register';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(isLogin ? 'Failed to login' : 'Failed to register user');
      }

      const data = await response.json();
      console.log(isLogin ? 'Login successful:' : 'Registration successful:', data);

      if (!isLogin) {
        await handleRegistration({ userId: data.userId, email: formData.email, name: formData.name });
      } else {
        navigate('/dashboard'); // or wherever you want to redirect after login
      }
    } catch (error) {
      console.error(isLogin ? 'Error during login:' : 'Error during registration:', error);
      setError(isLogin ? 'Login failed. Please try again.' : 'Registration failed. Please try again.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/verify-google-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!response.ok) {
        throw new Error(`Failed to verify Google token: ${response.status} ${response.statusText}`);
      }

      const userData = await response.json();
      await handleRegistration(userData);
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      setError('Google sign-in failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    console.log('Google Sign-In Failed');
    setError('Google sign-in failed. Please try again.');
  };

  const handleOtherSignIn = async (provider) => {
    console.log(`${provider} Sign-In Clicked`);
    setError(`${provider} sign-in is not implemented yet.`);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleLoginRegister = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="register-freelancer">
        <h2>{isLogin ? 'Login to Your Account' : 'Join Our Freelancer Community'}</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="social-sign-in">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
          />
          <button onClick={() => handleOtherSignIn('Facebook')} className="facebook-btn">
            <FaFacebook /> Facebook
          </button>
          <button onClick={() => handleOtherSignIn('LinkedIn')} className="linkedin-btn">
            <FaLinkedin /> LinkedIn
          </button>
          <button onClick={() => handleOtherSignIn('GitHub')} className="github-btn">
            <FaGithub /> GitHub
          </button>
        </div>
        <div className="divider">Or</div>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />
          )}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            <button 
              type="button" 
              onClick={togglePasswordVisibility} 
              className="password-toggle"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button type="submit" className="btn btn-primary">
            {isLogin ? 'Login' : 'Join Now'}
          </button>
        </form>
        <button onClick={toggleLoginRegister} className="btn btn-secondary">
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </GoogleOAuthProvider>
  );
};

export default RegisterFreelancer;