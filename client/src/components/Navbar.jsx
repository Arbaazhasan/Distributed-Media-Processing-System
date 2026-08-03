import React from 'react';
import { Film, Radio, Cpu } from 'lucide-react';

export default function Navbar({ socketConnected }) {
  return (
    <header className="glass-card navbar">
      <div className="brand">
        <div className="brand-icon">
          <Film size={22} />
        </div>
        <div>
          <h1 className="brand-title">Distributed Media Platform</h1>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div className="badge-status" style={{
          background: socketConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          borderColor: socketConnected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
          color: socketConnected ? 'var(--success)' : 'var(--error)'
        }}>
          <span className="status-dot" style={{
            background: socketConnected ? 'var(--success)' : 'var(--error)',
            boxShadow: socketConnected ? '0 0 10px var(--success)' : '0 0 10px var(--error)'
          }}></span>
          <Radio size={14} />
          {socketConnected ? 'Signaling WS Online' : 'Signaling Offline'}
        </div>
      </div>
    </header>
  );
}
