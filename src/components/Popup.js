import React, { useState, useEffect } from 'react';
import './Popup.css';

const Popup = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 500); // Match this with the CSS transition duration
  };

  if (!isVisible) return null;

  return (
    <div className={`popup-overlay ${isClosing ? 'closing' : ''}`}>
      <div className="popup-content">
        <button className="popup-close" onClick={handleClose}>&times;</button>
        <h2>Thanks for joining out Waitlist!</h2>
        <p>Post your data need or register as a freelancer for extra income.</p>
      </div>
    </div>
  );
};

export default Popup;