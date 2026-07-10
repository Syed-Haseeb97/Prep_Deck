import React from 'react';

const SPACES = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'screenshots', label: 'Screenshots' },
  { id: 'notes', label: 'Notes & text' },
  { id: 'videos', label: 'Videos' },
  { id: 'links', label: 'Links' }
];

export default function Sidebar({ current, onSwitch, counts, email, onLogout }) {
  return (
    <div className="sidebar">
      <div className="brand">
        <div className="brand-mark"></div>
        <h1>Prep Deck</h1>
      </div>
      {SPACES.map(s => (
        <button
          key={s.id}
          className={'nav-item' + (current === s.id ? ' active' : '')}
          onClick={() => onSwitch(s.id)}
        >
          <span className="dot"></span>
          {s.label}
          <span className="nav-count">{counts[s.id] || ''}</span>
        </button>
      ))}
      <div className="sidebar-footer">
        <div className="who">{email}</div>
        <button className="btn-ghost" onClick={onLogout}>Log out</button>
      </div>
    </div>
  );
}
