import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import emailjs from 'emailjs-com';
import Home from './pages/Home';
import PostDataNeed from './pages/PostDataNeed';
import RegisterFreelancer from './pages/RegisterFreelancer';
import RegisterDataRequester from './pages/RegisterDataRequester';
import ThankYouRegister from './components/ThankYouRegister';
import ThankYouSubmit from './components/ThankYouSubmit';
import Wait from './components/Wait';
import './styles/global.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Popup from './components/Popup';

function App() {
  useEffect(() => {
    emailjs.init("SF_Mf5rPsbaV133ly");
  }, []);

  return (
    <Router>
      <div className="datumz">
        <Header />
        <Popup />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post-data-need" element={<PostDataNeed />} />
            <Route path="/register-datarequester" element={<RegisterDataRequester />} />
            <Route path="/register-freelancer" element={<RegisterFreelancer />} />
            <Route path="/thank-you-register" element={<ThankYouRegister />} />
            <Route path="/thank-you-submit" element={<ThankYouSubmit />} />
            <Route path="/wait" element={<Wait />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;