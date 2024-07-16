import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PostDataNeed from './pages/PostDataNeed';
import RegisterFreelancer from './pages/RegisterFreelancer';
import './styles/global.css';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <div className="datumz">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post-data-need" element={<PostDataNeed />} />
            <Route path="/register-freelancer" element={<RegisterFreelancer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
