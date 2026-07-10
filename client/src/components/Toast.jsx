import React from 'react';

export default function Toast({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div className="toast" key={t.id}>
          <div className="tt">{t.title}</div>
          <div>{t.message}</div>
        </div>
      ))}
    </div>
  );
}
