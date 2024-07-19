import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PostDataNeed from './pages/PostDataNeed';
import RegisterFreelancer from './pages/RegisterFreelancer';
import './styles/global.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Popup from './components/Popup'; 

function App() {
  return (
    <Router>
      <div className="datumz">
        <Header />
        <Popup />  {/* Add the Popup component here */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post-data-need" element={<PostDataNeed />} />
            <Route path="/register-freelancer" element={<RegisterFreelancer />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;