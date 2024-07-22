import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './RegisterDataRequester.css';

const RegisterDataRequester = () => {
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
            await fetch('/.netlify/functions/send-notification-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject: 'New User Registration (Data Requester)',
                    email: userData.email,
                    name: userData.name
                }),
            });
            navigate('/thank-you-register');
        } catch (error) {
            console.error('Error during registration process:', error);
            setError('An error occurred during registration. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const endpoint = isLogin ? '/.netlify/functions/login' : '/.netlify/functions/register';
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

            const data = await response.json();
            console.log(isLogin ? 'Login successful:' : 'Registration successful:', data);

            if (!isLogin) {
                await handleRegistration({ userId: data.userId, email: formData.email, name: formData.name });
            } else {
                localStorage.setItem('user', JSON.stringify({ userId: data.userId, email: data.email, name: data.name }));
                navigate('/post-data-need');
            }
        } catch (error) {
            console.error(isLogin ? 'Error during login:' : 'Error during registration:', error);
            setError(error.message);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError(null);
        try {
            const response = await fetch('/.netlify/functions/verify-google-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to verify Google token');
            }

            const userData = await response.json();
            await handleRegistration(userData);
        } catch (error) {
            console.error('Error during Google sign-in:', error);
            setError(error.message);
        }
    };

    const handleGoogleError = () => {
        console.log('Google Sign-In Failed');
        setError('Google sign-in failed. Please try again.');
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
            <div className="register-datarequester">
                <h2>{isLogin ? 'Login to Your Account' : 'Sign Up for an Account'}</h2>
                <div className="social-sign-in">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                    />
                </div>
                <div className="divider">Or</div>
                {error && <div className="error-message">{error}</div>}
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
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>
                <button onClick={toggleLoginRegister} className="btn btn-secondary">
                    {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                </button>
            </div>
        </GoogleOAuthProvider>
    );
};

export default RegisterDataRequester;