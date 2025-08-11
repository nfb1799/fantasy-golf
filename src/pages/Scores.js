import React, { useState, useEffect } from 'react';

const NUM_HOLES = 18;

function getInitialScores(players) {
  // Each player: { name, handicap, scores: [null, ...] }
  return players.map((p) => ({
    ...p,
    scores: Array(NUM_HOLES).fill(''),
    handicap: p.handicap || '',
  }));
}

function Scores() {
  // Reset all scores and handicaps
  const handleReset = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, handicap: '', scores: Array(NUM_HOLES).fill('') })));
    setUserHandicap('');
    // Optionally clear from localStorage as well
    setTimeout(() => {
      const [user, ...pros] = players.map((p) => ({ ...p, handicap: '', scores: Array(NUM_HOLES).fill('') }));
      localStorage.setItem('fantasyGolfScores', JSON.stringify({ user, pros }));
    }, 0);
  };
  // Load picks and names
  const [pickedPros, setPickedPros] = useState([]);
  const [players, setPlayers] = useState([]); // [{ name, handicap, scores: [] }]
  const [userName, setUserName] = useState('You');
  const [userHandicap, setUserHandicap] = useState('');

  useEffect(() => {
    // Only allow one pro pick (string or array with one element)
    let picks = JSON.parse(localStorage.getItem('fantasyGolfPicks') || '[]');
    if (Array.isArray(picks)) {
      picks = picks.length > 0 ? [picks[0]] : [];
    } else if (typeof picks === 'string') {
      picks = picks ? [picks] : [];
    } else {
      picks = [];
    }
    setPickedPros(picks);
    // Load from localStorage if exists
    const saved = localStorage.getItem('fantasyGolfScores');
    if (saved) {
      const { user, pros } = JSON.parse(saved);
      setUserName(user.name);
      setUserHandicap(user.handicap);
      // Only keep one pro if present
      const proArr = Array.isArray(pros) && pros.length > 0 ? [pros[0]] : [];
      setPlayers([
        { name: user.name, handicap: user.handicap, scores: user.scores },
        ...proArr.map((p) => ({ name: p.name, handicap: p.handicap, scores: p.scores })),
      ]);
      return;
    }
    // Default: user + one pro
    setPlayers(
      getInitialScores([
        { name: 'You', handicap: '', },
        ...picks.map((name) => ({ name, handicap: '' })),
      ])
    );
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (players.length === 0) return;
    const [user, ...pros] = players;
    localStorage.setItem('fantasyGolfScores', JSON.stringify({
      user: user,
      pros: pros,
    }));
  }, [players]);

  const handleHandicapChange = (idx, value) => {
    setPlayers((prev) => prev.map((p, i) => i === idx ? { ...p, handicap: value } : p));
    if (idx === 0) setUserHandicap(value);
  };

  const handleScoreChange = (playerIdx, holeIdx, value) => {
    setPlayers((prev) => prev.map((p, i) =>
      i === playerIdx
        ? { ...p, scores: p.scores.map((s, h) => h === holeIdx ? value : s) }
        : p
    ));
  };

  // Stroke index for each hole (editable by user, default all 1)
  const [strokeIndex, setStrokeIndex] = useState(Array(NUM_HOLES).fill(1));

  // Save stroke index to localStorage
  useEffect(() => {
    localStorage.setItem('fantasyGolfStrokeIndex', JSON.stringify(strokeIndex));
  }, [strokeIndex]);

  // Load stroke index from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fantasyGolfStrokeIndex');
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length === NUM_HOLES) setStrokeIndex(arr);
      } catch {}
    }
  }, []);

  // Calculate strokes received per player per hole using user-set stroke index
  function strokesReceived(handicap, holeIdx) {
    // USGA: player gets 1 stroke on each of the lowest stroke index holes up to their handicap
    // For handicaps > 18, some holes get 2 strokes (e.g. 20 handicap: 2 holes get 2 strokes, rest get 1)
    // For negative handicap, add strokes to highest index holes
    const hcap = parseInt(handicap, 10) || 0;
    if (hcap === 0) return 0;
    if (hcap > 0) {
      // Find the order of holes by stroke index (lowest first)
      // Each hole gets 1 stroke if hcap >= 18, and the (hcap % 18) lowest index holes get a 2nd stroke
      // e.g. hcap = 25: all holes get 1, 7 lowest get 2
      // Build an array of hole indices sorted by stroke index ascending
      const sorted = strokeIndex
        .map((idx, i) => ({ idx, i }))
        .sort((a, b) => a.idx - b.idx || a.i - b.i)
        .map(obj => obj.i);
      let strokes = 0;
      if (hcap >= NUM_HOLES) {
        strokes = 1;
        // Give extra strokes to the lowest (hcap % NUM_HOLES) holes
        const extra = hcap % NUM_HOLES;
        if (extra > 0 && sorted.slice(0, extra).includes(holeIdx)) {
          strokes += 1;
        }
      } else {
        // Only the lowest hcap holes get a stroke
        if (sorted.slice(0, hcap).includes(holeIdx)) {
          strokes = 1;
        }
      }
      return strokes;
    } else {
      // Negative handicap: subtract strokes from holes with highest stroke index
      return strokeIndex[holeIdx] > NUM_HOLES + hcap ? -1 : 0;
    }
  }

  // Calculate net scores (gross - strokes received), recalculate when strokeIndex changes
  const grossScores = React.useMemo(() => players.map((p) => p.scores.map((s) => parseInt(s, 10) || null)), [players]);
  const netScores = React.useMemo(() =>
    players.map((p, i) =>
      p.scores.map((s, h) => {
        const gross = parseInt(s, 10);
        if (isNaN(gross)) return null;
        return gross - strokesReceived(p.handicap, h);
      })
    ),
    [players, strokeIndex]
  );
  // Best ball: lowest net score per hole
  const bestBall = React.useMemo(() => Array(NUM_HOLES).fill(null).map((_, h) => {
    let min = null;
    netScores.forEach((scores) => {
      const v = scores[h];
      if (typeof v === 'number' && !isNaN(v)) min = min === null ? v : Math.min(min, v);
    });
    return min;
  }), [netScores]);
  const totals = React.useMemo(() => players.map((p, i) => netScores[i].reduce((sum, s) => sum + (s || 0), 0)), [players, netScores]);
  const bestBallTotal = React.useMemo(() => bestBall.reduce((sum, s) => sum + (s || 0), 0), [bestBall]);

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 24 }}>
      <h2>Enter Handicaps & Scores</h2>
      <button
        onClick={handleReset}
        style={{
          background: '#e53935',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 22px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 2px 8px #0002',
          marginBottom: 18,
        }}
      >
        Reset Scores
      </button>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 6 }}>Hole</th>
            <th style={{ textAlign: 'center', padding: 6 }}>Stroke Index</th>
            {players.map((p, i) => (
              <th key={i} style={{ textAlign: 'center', padding: 6 }}>{p.name}</th>
            ))}
            <th style={{ textAlign: 'center', padding: 6, color: '#1976d2' }}>Best Ball</th>
          </tr>
          <tr>
            <td style={{ fontWeight: 600, padding: 6 }}>Handicap</td>
            <td></td>
            {players.map((p, i) => (
              <td key={i}>
                <input
                  type="number"
                  value={p.handicap}
                  onChange={e => handleHandicapChange(i, e.target.value)}
                  style={{ width: 50, padding: 4, borderRadius: 4, border: '1px solid #bbb' }}
                  min={-20}
                  max={40}
                />
              </td>
            ))}
            <td></td>
          </tr>
        </thead>
        <tbody>
          {Array(NUM_HOLES).fill(0).map((_, h) => (
            <tr key={h}>
              <td style={{ fontWeight: 600, padding: 6 }}>{h + 1}</td>
              <td style={{ textAlign: 'center', color: '#888', fontSize: '0.95em' }}>
                <input
                  type="number"
                  value={strokeIndex[h]}
                  min={1}
                  max={NUM_HOLES}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= NUM_HOLES) {
                      setStrokeIndex(idxArr => idxArr.map((v, idx) => idx === h ? val : v));
                    }
                  }}
                  style={{ width: 40, padding: 2, borderRadius: 4, border: '1px solid #bbb', textAlign: 'center' }}
                />
              </td>
              {players.map((p, i) => {
                const gross = grossScores[i][h];
                const net = netScores[i][h];
                const isBest = bestBall[h] !== null && net === bestBall[h];
                return (
                  <td key={i} style={{ background: isBest ? '#c8e6c9' : undefined, padding: 4, textAlign: 'center' }}>
                    <input
                      type="number"
                      value={p.scores[h]}
                      onChange={e => handleScoreChange(i, h, e.target.value)}
                      style={{ width: 50, padding: 4, borderRadius: 4, border: '1px solid #bbb', marginBottom: 2 }}
                      min={1}
                      max={20}
                    />
                    <div style={{ fontSize: '0.9em', color: '#1976d2' }}>
                      {net !== null ? `Net: ${net}` : ''}
                    </div>
                  </td>
                );
              })}
              <td style={{ color: '#1976d2', fontWeight: 600, textAlign: 'center' }}>{bestBall[h] !== null ? bestBall[h] : '-'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ fontWeight: 600, padding: 6 }}>Total</td>
            <td></td>
            {totals.map((t, i) => (
              <td key={i} style={{ fontWeight: 600, textAlign: 'center' }}>{t}</td>
            ))}
            <td style={{ color: '#1976d2', fontWeight: 700, textAlign: 'center' }}>{bestBallTotal}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default Scores;
