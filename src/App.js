import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import PostDataNeed from './pages/PostDataNeed';
import RegisterFreelancer from './pages/RegisterFreelancer';
import './styles/global.css';


const App = () => (
  <Router basename="/dataumz">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/post-data-need" element={<PostDataNeed />} />
      <Route path="/register-freelancer" element={<RegisterFreelancer />} />
    </Routes>
  </Router>
);

export default App;
