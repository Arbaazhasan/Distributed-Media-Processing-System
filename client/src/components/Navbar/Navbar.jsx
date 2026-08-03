import React from 'react';
import { Film, Radio } from 'lucide-react';
import './Navbar.scss';

export default function Navbar({ socketConnected }) {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <div className="navbar__brand-icon">
          <Film size={22} />
        </div>
        <h1 className="navbar__brand-title">Distributed Media Platform</h1>
      </div>

      <div className="navbar__actions">
        <div className={`navbar__status-badge ${socketConnected ? 'navbar__status-badge--online' : ''}`}>
          <span className={`navbar__status-dot ${socketConnected ? 'navbar__status-dot--online' : ''}`} />
          <Radio size={14} />
          {socketConnected ? 'Signaling WS Online' : 'Signaling Offline'}
        </div>
      </div>
    </header>
  );
}
