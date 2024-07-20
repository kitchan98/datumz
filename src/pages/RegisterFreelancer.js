import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { FaFacebook, FaLinkedin, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(isLogin ? 'Login submitted:' : 'Registration submitted:', formData);
    
    try {
      // Here you would typically make an API call to register or login the user
      // For this example, we'll simulate a successful registration/login
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call

      if (!isLogin) {
        // If it's a registration, navigate to the thank you page
        navigate('/thank-you-register');
      } else {
        // If it's a login, you might want to navigate to a different page
        // For now, we'll just log a message
        console.log('Login successful');
      }
    } catch (error) {
      console.error('Error during submission:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('Google Sign-In Successful', credentialResponse);
    // Here you would typically verify the Google token on your server
    // For this example, we'll simulate a successful sign-in
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call
    navigate('/thank-you-register');
  };

  const handleGoogleError = () => {
    console.log('Google Sign-In Failed');
    // Handle error (e.g., show error message to user)
  };

  const handleOtherSignIn = async (provider) => {
    console.log(`${provider} Sign-In Clicked`);
    // Here you would typically implement the sign-in logic for the chosen provider
    // For this example, we'll simulate a successful sign-in
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call
    navigate('/thank-you-register');
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