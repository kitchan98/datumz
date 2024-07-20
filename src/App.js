import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PostDataNeed from './pages/PostDataNeed';
import RegisterFreelancer from './pages/RegisterFreelancer';
import RegisterDataRequester from './pages/RegisterDataRequester';
import ThankYouRegister from './components/ThankYouRegister';
import ThankYouSubmit from './components/ThankYouSubmit';
import './styles/global.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Popup from './components/Popup'; 

function App() {
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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;