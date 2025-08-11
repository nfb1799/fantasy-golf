import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Home from './pages/Home';
import Picks from './pages/Picks';
import Leaderboard from './pages/Leaderboard';
import Scores from './pages/Scores';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{
          width: '100%',
          background: '#1976d2',
          padding: '10px 0',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          gap: 32,
          boxShadow: '0 2px 8px #0002',
        }}>
          <Link to="/" style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem', textDecoration: 'none' }}>Home</Link>
          <Link to="/picks" style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem', textDecoration: 'none' }}>Pick Pros</Link>
          <Link to="/scores" style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem', textDecoration: 'none' }}>Scores</Link>
          <Link to="/leaderboard" style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem', textDecoration: 'none' }}>Leaderboard</Link>
        </nav>
        <div style={{ paddingTop: 60 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/picks" element={<Picks />} />
            <Route path="/scores" element={<Scores />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
