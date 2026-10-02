import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar">
      <div className="brand">⚡ EV Wireless Charging</div>
      <nav>
        {user.role === 'admin' ? (
          <>
            <NavLink to="/admin/stations">Stations</NavLink>
            <NavLink to="/admin/active">Active</NavLink>
            <NavLink to="/admin/stats">Stats</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/">Charge</NavLink>
            <NavLink to="/history">History</NavLink>
          </>
        )}
        <NavLink to="/settings">Settings</NavLink>
        <button onClick={handleLogout}>Logout</button>
      </nav>
    </div>
  );
}
