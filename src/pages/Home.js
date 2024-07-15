import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactData({
      ...contactData,
      [name]: value,
    });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(contactData);
  };

  return (
    <div className="home">
      <section className="hero">
        <h1>DATUMX</h1>
        <p className="tagline">GET ANY DATA YOU WANT FOR YOUR RESEARCH OR BUSINESS</p>
        <div className="cta-buttons">
          <Link to="/post-data-need" className="btn btn-primary">POST YOUR DATA NEED</Link>
          <Link to="/register-freelancer" className="btn btn-secondary">REGISTER AS FREELANCER</Link>
        </div>
      </section>
      
      <section className="how-it-works">
        <h2>HOW IT WORKS</h2>
        <p className="subtitle">GETTING YOUR DATA NEED THROUGH COLLECTIVE EFFORTS</p>
        
        <div className="steps">
          <div className="step">
            <div className="icon">
              <i className="fas fa-chevron-up"></i>
            </div>
            <h3>POST YOUR NEED</h3>
            <p>What kind of data do you need? Is it an image or a video? How many do you need? 10 images or 100k images?</p>
          </div>
          
          <div className="step">
            <div className="icon">
              <i className="fas fa-compress-arrows-alt"></i>
            </div>
            <h3>CONNECT FREELANCER</h3>
            <p>Work with our network of freelancers who can collectively gather data for your project.</p>
          </div>
          
          <div className="step">
            <div className="icon">
              <i className="fas fa-envelope-open-text"></i>
            </div>
            <h3>GET YOUR DATA</h3>
            <p>If you are happy with the data you received, you can confirm the transaction and you're good to go.</p>
          </div>
        </div>
      </section>
      
      <section className="contact-form">
        <h2>Have a Question?</h2>
        <form onSubmit={handleContactSubmit}>
          <input
            type="text"
            name="name"
            value={contactData.name}
            onChange={handleContactChange}
            placeholder="Enter your name..."
            required
          />
          <input
            type="email"
            name="email"
            value={contactData.email}
            onChange={handleContactChange}
            placeholder="Enter your email..."
            required
          />
          <textarea
            name="message"
            value={contactData.message}
            onChange={handleContactChange}
            placeholder="Message"
            required
          ></textarea>
          <button type="submit" className="btn btn-primary">Send Message</button>
        </form>
      </section>
    </div>
  );
};

export default Home;
