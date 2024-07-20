import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import './ThankYouRegister.css';

const ThankYouRegister = () => {
  return (
    <div className="thank-you-register">
      <h2>Thank You for Registering!</h2>
      <p>We're excited to have you on board. We will let you know once we launch with more information.</p>
      <Link to="/" className="btn btn-primary">
        <FaHome /> Return to Home Page
      </Link>
    </div>
  );
};

export default ThankYouRegister;