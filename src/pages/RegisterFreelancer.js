import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { FaFacebook, FaLinkedin, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
import './RegisterFreelancer.css';

const AuthComponent = () => {
const [isLogin, setIsLogin] = useState(true);
const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
});
const [showPassword, setShowPassword] = useState(false);

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

const toggleAuthMode = () => {
  setIsLogin(!isLogin);
  setFormData({ name: '', email: '', password: '' });
};

return (
  <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
    <div className="auth-component">
      <h2>{isLogin ? 'Login' : 'Join Our Freelancer Community'}</h2>
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
      <p className="auth-switch">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button onClick={toggleAuthMode} className="switch-btn">
          {isLogin ? 'Register' : 'Login'}
        </button>
      </p>
    </div>
  </GoogleOAuthProvider>
);
};

export default AuthComponent;