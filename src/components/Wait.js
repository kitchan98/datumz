import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import './Wait.css';

const Wait = () => {
  return (
    <div className="wait">
      <h2>Thank you for checking in!</h2>
      <p>You are on the waitlist. We will notify you once we launch. If there is any question in the meantime, please contact kitchan98@gmail.com</p>
      <Link to="/" className="btn btn-primary">
        <FaHome /> Return to Home Page
      </Link>
    </div>
  );
};

export default Wait;