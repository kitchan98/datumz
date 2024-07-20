import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { FaFacebook, FaLinkedin, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
import './RegisterDataRequester.css';
import React, { useState, useEffect } from 'react';

const RegisterDataRequester = () => {
    useEffect(() => {
        console.log("Google Client ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID);
    }, []);
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
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to register user');
            }

            navigate('/thank-you-submit');
        } catch (error) {
            console.error('Error during submission:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        console.log('Google Sign-In Successful', credentialResponse);
        console.log('Credential:', credentialResponse.credential);
    
        try {
            console.log('Attempting to verify token');
            const response = await fetch('http://localhost:5001/api/verify-google-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });
    
            console.log('Response received', response);
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to verify Google token: ${response.status} ${response.statusText}. ${errorText}`);
            }
    
            // Log the response body
            const responseText = await response.text();
            console.log('Response body:', responseText);
    
            // Try to parse the response as JSON
            let userData;
            try {
                userData = JSON.parse(responseText);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                console.log('Raw response:', responseText);
                throw new Error('Invalid JSON response from server');
            }
    
            console.log('User data:', userData);
    
            console.log('Attempting to navigate');
            navigate('/thank-you-submit');
            console.log('Navigation called');
        } catch (error) {
            console.error('Error during Google sign-in:', error);
            // Handle error (e.g., show error message to user)
        }
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
        navigate('/thank-you-submit');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleLoginRegister = () => {
        setIsLogin(!isLogin);
    };

    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <div className="register-datarequester">
                <h2>{isLogin ? 'Login to Your Account' : 'Sign In to Post Your Data'}</h2>
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

export default RegisterDataRequester;