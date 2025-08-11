import React from 'react';

function Home() {
  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#f5f5f5', borderRadius: 12, boxShadow: '0 2px 12px #0001' }}>
      <h1 style={{ color: '#1976d2', fontWeight: 700, fontSize: '2.5rem', marginBottom: 12 }}>Fantasy Golf</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: 24 }}>
        Welcome! Create your own fantasy golf league, pick your favorite pros each week, and compete with your friends for the best ball score.<br /><br />
        <strong>How it works:</strong>
      </p>
      <ol style={{ textAlign: 'left', margin: '0 auto 24px', maxWidth: 500, fontSize: '1.1rem' }}>
        <li>Each week, select <b>4 pros</b> from the PGA Tour.</li>
        <li>After the tournament, enter their scores.</li>
        <li>Handicaps are applied automatically.</li>
        <li>The best ball score for your team is calculated for each hole.</li>
        <li>Compare your results with your friends on the leaderboard!</li>
      </ol>
      <div style={{ marginTop: 32 }}>
        <a href="/picks" style={{
          display: 'inline-block',
          background: '#1976d2',
          color: '#fff',
          padding: '14px 32px',
          borderRadius: 8,
          fontSize: '1.2rem',
          fontWeight: 600,
          textDecoration: 'none',
          boxShadow: '0 2px 8px #0002',
          transition: 'background 0.2s',
        }}>Get Started</a>
      </div>
    </div>
  );
}

export default Home;
