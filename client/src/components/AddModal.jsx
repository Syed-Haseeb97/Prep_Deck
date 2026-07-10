import React, { useState } from 'react';

export default function AddModal({ space, onClose, onSaveItem, onSaveTask }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [when, setWhen] = useState('');
  const [tag, setTag] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit() {
    setErr('');
    if (space === 'timeline') {
      if (!title || !when) { setErr('Add a title and a time.'); return; }
      setBusy(true);
      await onSaveTask({ title, when: new Date(when).toISOString(), tag, done: false });
      setBusy(false);
      return;
    }
    if (space === 'screenshots') {
      if (!title) { setErr('Give it a short title.'); return; }
      if (file && file.size > 4.5 * 1024 * 1024) { setErr('Keep files under about 4.5MB.'); return; }
      setBusy(true);
      await onSaveItem({ title }, file);
      setBusy(false);
      return;
    }
    if (space === 'notes') {
      if (!title) { setErr('Give it a short title.'); return; }
      setBusy(true);
      await onSaveItem({ title, body });
      setBusy(false);
      return;
    }
    if (space === 'videos') {
      if (!title || !url) { setErr('Add a title and a link.'); return; }
      setBusy(true);
      await onSaveItem({ title, url, body });
      setBusy(false);
      return;
    }
    if (space === 'links') {
      if (!title || !url) { setErr('Add a title and a URL.'); return; }
      setBusy(true);
      await onSaveItem({ title, url });
      setBusy(false);
      return;
    }
  }

  return (
    <div className="modal-overlay active" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        {space === 'timeline' && (
          <>
            <h3>Add to timeline</h3>
            <label className="field-label">What do you need to do</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Finish AIML playlist, module 1" />
            <label className="field-label">When</label>
            <input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} />
            <label className="field-label">Tag (optional)</label>
            <input type="text" value={tag} onChange={e => setTag(e.target.value)} placeholder="e.g. AIML, research, series" />
          </>
        )}
        {space === 'screenshots' && (
          <>
            <h3>Add a screenshot</h3>
            <label className="field-label">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Roadmap from that AIML reel" />
            <label className="field-label">Image file</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
            <div className="file-hint">Works best under ~4.5MB per image.</div>
          </>
        )}
        {space === 'notes' && (
          <>
            <h3>Add a note</h3>
            <label className="field-label">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Research: choosing an AIML specialization" />
            <label className="field-label">Text</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write it out here" />
          </>
        )}
        {space === 'videos' && (
          <>
            <h3>Add a video</h3>
            <label className="field-label">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. CS50 AI lecture 3" />
            <label className="field-label">Video link</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://youtube.com/..." />
            <label className="field-label">Note (optional)</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Why you saved this" />
            <div className="file-hint">Saved as a link, not a raw file — keeps storage light.</div>
          </>
        )}
        {space === 'links' && (
          <>
            <h3>Add a link</h3>
            <label className="field-label">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Best CS electives for AIML" />
            <label className="field-label">URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
          </>
        )}

        {err && <div className="auth-error">{err}</div>}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ width: 'auto', padding: '9px 18px' }} disabled={busy} onClick={submit}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
