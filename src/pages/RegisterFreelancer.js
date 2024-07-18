import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { FaFacebook, FaLinkedin, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
import './RegisterFreelancer.css';

const RegisterFreelancer = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isLogin ? 'Login submitted:' : 'Registration submitted:', formData);
  };

  const handleGoogleSuccess = (credentialResponse) => {
    console.log('Google Sign-In Successful', credentialResponse);
  };

  const handleGoogleError = () => {
    console.log('Google Sign-In Failed');
  };

  const handleOtherSignIn = (provider) => {
    console.log(`${provider} Sign-In Clicked`);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleLoginRegister = () => {
    setIsLogin(!isLogin);
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <div className="register-freelancer">
        <h2>{isLogin ? 'Login to Your Account' : 'Join Our Freelancer Community'}</h2>
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