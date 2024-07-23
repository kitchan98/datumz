import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com';
import Home from './pages/Home';
import PostDataNeed from './pages/PostDataNeed';
import RegisterFreelancer from './pages/RegisterFreelancer';
import ThankYouRegister from './components/ThankYouRegister';
import ThankYouSubmit from './components/ThankYouSubmit';
import Wait from './components/Wait';
import './styles/global.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Popup from './components/Popup';
import Contact from './pages/Contact';
import 'leaflet/dist/leaflet.css';
import LoadingSpinner from './components/LoadingSpinner';

function AppContent() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const customNavigate = (path) => {
    setIsLoading(true);
    setTimeout(() => {
      navigate(path);
      setIsLoading(false);
    }, 2000);
  };

  useEffect(() => {
    emailjs.init("SF_Mf5rPsbaV133ly");
  }, []);

  return (
    <div className="datumz">
      <Header />
      <Popup />
      {isLoading && <LoadingSpinner />}
      <main>
        <Routes>
          <Route path="/" element={<Home customNavigate={customNavigate} />} />
          <Route path="/contact" element={<Contact customNavigate={customNavigate} />} />
          <Route path="/post-data-need" element={<PostDataNeed customNavigate={customNavigate} />} />
          <Route path="/register-freelancer" element={<RegisterFreelancer customNavigate={customNavigate} />} />
          <Route path="/thank-you-register" element={<ThankYouRegister customNavigate={customNavigate} />} />
          <Route path="/thank-you-submit" element={<ThankYouSubmit customNavigate={customNavigate} />} />
          <Route path="/wait" element={<Wait customNavigate={customNavigate} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;