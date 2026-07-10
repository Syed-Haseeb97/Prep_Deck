import React from 'react';

const META = {
  screenshots: { title: 'Screenshots', sub: 'Small images — diagrams, posts, anything worth a glance later.' },
  notes: { title: 'Notes & text', sub: 'Written things — ideas, research notes, plain text.' },
  videos: { title: 'Videos', sub: 'Video links to watch — lectures, series, AIML playlists.' },
  links: { title: 'Links', sub: 'Pages and articles worth coming back to.' }
};

export default function SpaceView({ space, items, onDelete, onAdd }) {
  const meta = META[space];

  return (
    <>
      <Header meta={meta} onAdd={onAdd} />
      {items.length === 0 ? (
        <div className="empty">
          <h3>Nothing saved in {meta.title.toLowerCase()} yet</h3>
          <p>Add the first one — only what matters, so it's easy to find later.</p>
          <button className="btn-secondary" onClick={onAdd}>Add one</button>
        </div>
      ) : (
        <div className="grid">
          {items.map(it => (
            <Card key={it.id} space={space} item={it} onDelete={() => onDelete(it)} />
          ))}
        </div>
      )}
    </>
  );
}

function Header({ meta, onAdd }) {
  return (
    <div className="main-header">
      <div>
        <h2>{meta.title}</h2>
        <div className="sub">{meta.sub}</div>
      </div>
      <button className="fab" onClick={onAdd}>+ Add</button>
    </div>
  );
}

function Card({ space, item, onDelete }) {
  const date = new Date(item.createdAt);
  const dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="card">
      {space === 'screenshots' && item.imageUrl && (
        <img src={item.imageUrl} alt={item.title} />
      )}
      <div className="card-title">{item.title}</div>
      {space === 'notes' && <div className="card-body">{item.body}</div>}
      {(space === 'videos' || space === 'links') && (
        <a className="card-link" href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>
      )}
      {space === 'videos' && item.body && <div className="card-body">{item.body}</div>}
      <div className="card-meta">{dateLabel}</div>
      <div className="card-actions">
        <button className="icon-btn" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
