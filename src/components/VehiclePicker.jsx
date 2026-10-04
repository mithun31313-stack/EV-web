import React, { useState, useRef, useEffect } from 'react';

// A type-to-search box: user types their car/bike brand or model,
// sees matching suggestions from the full vehicle list, and picks one.
export default function VehiclePicker({ vehicles, onSelect }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const boxRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matches = query.trim()
    ? vehicles
        .filter((v) => `${v.brand} ${v.model}`.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8)
    : vehicles.slice(0, 8);

  const pick = (v) => {
    setSelected(v);
    setQuery(`${v.brand} ${v.model}`);
    setOpen(false);
    onSelect(v);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    if (selected) {
      setSelected(null);
      onSelect(null);
    }
  };

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <input
        className="input"
        placeholder="Type your car or bike — e.g. Nexon, Ather 450X..."
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
      />
      {open && matches.length > 0 && (
        <div
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
            background: '#fff', border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
            maxHeight: 220, overflowY: 'auto', marginTop: -6,
          }}
        >
          {matches.map((v) => (
            <div
              key={v.id}
              onClick={() => pick(v)}
              style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 14 }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <strong>{v.brand} {v.model}</strong>
              <span className="muted small"> — {v.battery_kwh} kWh</span>
            </div>
          ))}
        </div>
      )}
      {open && query.trim() && matches.length === 0 && (
        <div
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
            background: '#fff', border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
            padding: '12px 14px', marginTop: -6,
          }}
        >
          <span className="muted small">
            No match found — you can still pick an amount manually below.
          </span>
        </div>
      )}
    </div>
  );
}
