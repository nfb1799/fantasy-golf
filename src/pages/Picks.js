import React, { useState, useEffect } from 'react';

const PROS = [
  "Scottie Scheffler",
  "Rory McIlroy",
  "Jon Rahm",
  "Xander Schauffele",
  "Collin Morikawa",
  "Viktor Hovland",
  "Ludvig Åberg",
  "Patrick Cantlay",
  "Wyndham Clark",
  "Max Homa"
];


function Picks() {
  const [selectedPro, setSelectedPro] = useState('');
  const [saved, setSaved] = useState(false);

  // Load pick from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fantasyGolfPicks');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) setSelectedPro(parsed[0]);
      else if (typeof parsed === 'string') setSelectedPro(parsed);
    }
  }, []);

  const handleSelect = (pro) => {
    setSelectedPro(pro);
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('fantasyGolfPicks', JSON.stringify([selectedPro]));
    setSaved(true);
  };

  return (
    <div>
      <h2>Pick Your Pro</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {PROS.map((pro) => (
          <li key={pro} style={{ margin: '8px 0' }}>
            <label>
              <input
                type="radio"
                name="pro-pick"
                checked={selectedPro === pro}
                onChange={() => handleSelect(pro)}
              />
              {pro}
            </label>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 16 }}>
        <button
          onClick={handleSave}
          style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 28px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0002',
            marginRight: 12,
            opacity: selectedPro ? 1 : 0.7,
          }}
          disabled={!selectedPro}
        >
          Save Pick
        </button>
        {saved && <span style={{ color: '#388e3c', fontWeight: 500 }}>Pick saved!</span>}
      </div>
      <div style={{ marginTop: 16 }}>
        <strong>Your Pick:</strong> {selectedPro || 'None'}
      </div>
    </div>
  );
}

export default Picks;
