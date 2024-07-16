import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PostDataNeed from './pages/PostDataNeed';
import RegisterFreelancer from './pages/RegisterFreelancer';

const App = () => (
  <Router basename="/DatumZ/datumz">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/post-data-need" element={<PostDataNeed />} />
      <Route path="/register-freelancer" element={<RegisterFreelancer />} />
      {/* Add other routes here */}
    </Routes>
  </Router>
);

export default App;
