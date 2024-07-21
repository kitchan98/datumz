import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import emailjs from 'emailjs-com';
import './Home.css';
import Popup from '../components/Popup';

const Home = () => {
  const [contactData, setContactData] = useState({
    from_name: '',
    reply_to: '',
    message: ''
  });

  const [submitStatus, setSubmitStatus] = useState('');

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactData(prevData => ({
      ...prevData,
      [name]: value,
      from_name: name === 'from_name' ? value : prevData.from_name
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('Sending...');

    try {
      const result = await emailjs.sendForm(
        'service_20cnorp',
        'template_15jdxgq',
        e.target,
        'SF_Mf5rPsbaV133ly'
      );

      console.log(result.text);
      setSubmitStatus('Message sent successfully!');
      setContactData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="home">
      <Popup />
      <section className="hero">
        <h1>DATUMZ</h1>
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
            <p>Fill out our form and let us know what kind of data do you need. Is it an image or a video? How many do you need? 10 images or 100k images?</p>
          </div>

          <div className="step">
            <div className="icon">
              <i className="fas fa-compress-arrows-alt"></i>
            </div>
            <h3>CONNECT FREELANCER</h3>
            <p>Work with our network of freelancers who can collectively gather data for your project. Instead of having 1 person getting data for your use-case, why not have 20 people do it for you</p>
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
            name="from_name"
            value={contactData.from_name}
            onChange={handleContactChange}
            placeholder="Your name"
            required
          />
          <input
            type="email"
            name="reply_to"
            value={contactData.reply_to}
            onChange={handleContactChange}
            placeholder="Your email"
            required
          />
          <textarea
            name="message"
            value={contactData.message}
            onChange={handleContactChange}
            placeholder="Your message"
            required
          ></textarea>
          <button type="submit">Send</button>
        </form>
        {submitStatus && <p>{submitStatus}</p>}
      </section>
    </div>
  );
};

export default Home;
