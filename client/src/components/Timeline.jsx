import React from 'react';

export default function Timeline({ tasks, onToggle, onDelete, onAdd }) {
  const now = new Date();
  const sorted = [...tasks].sort((a, b) => toDate(a.when) - toDate(b.when));
  const nextUpcoming = sorted.find(t => !t.done && toDate(t.when) > now);

  return (
    <>
      <div className="main-header">
        <div>
          <h2>Timeline</h2>
          <div className="sub">Everything you've scheduled, in order.</div>
        </div>
        <button className="fab" onClick={onAdd}>+ Add</button>
      </div>

      {sorted.length === 0 ? (
        <div className="empty">
          <h3>No tasks on the timeline yet</h3>
          <p>Add what you need to do and when — an AIML video series, a research task, anything with a date.</p>
          <button className="btn-secondary" onClick={onAdd}>Add one</button>
        </div>
      ) : (
        <div className="timeline">
          {sorted.map(t => {
            const when = toDate(t.when);
            const isNext = nextUpcoming && t.id === nextUpcoming.id;
            return (
              <div key={t.id} className={'t-item' + (t.done ? ' done' : '') + (isNext ? ' upcoming' : '')}>
                <div className="t-row">
                  <div>
                    <div className="t-when mono">
                      {when.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="t-title">{t.title}</div>
                    {t.tag && <span className="t-tag">{t.tag}</span>}
                  </div>
                  <div className="card-actions" style={{ paddingTop: 0 }}>
                    <button className="icon-btn" onClick={() => onToggle(t)}>{t.done ? 'Undo' : 'Done'}</button>
                    <button className="icon-btn" onClick={() => onDelete(t)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function toDate(when) {
  return new Date(when);
}
