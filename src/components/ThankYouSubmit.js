import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import './ThankYouSubmit.css';

const ThankYouSubmit = () => {
  return (
    <div className="thank-you-submit">
      <h2>Your data request has been submitted successfully!</h2>
      <p>We're excited to have you on board.</p>
      <Link to="/" className="btn btn-primary">
        <FaHome /> Return to Home Page
      </Link>
    </div>
  );
};

export default ThankYouSubmit;