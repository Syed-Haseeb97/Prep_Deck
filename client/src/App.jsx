import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchItems, createItem, removeItem, imageUrl,
  fetchTasks, createTask, patchTask, removeTask,
  getToken, setToken, getStoredEmail, setStoredEmail
} from './api.js';

import Login from './components/Login.jsx';
import Sidebar from './components/Sidebar.jsx';
import SpaceView from './components/SpaceView.jsx';
import Timeline from './components/Timeline.jsx';
import AddModal from './components/AddModal.jsx';
import Toast from './components/Toast.jsx';

const SPACE_TYPES = ['screenshots', 'notes', 'videos', 'links'];

export default function App() {
  const [email, setEmail] = useState(getToken() ? getStoredEmail() : null);
  const [space, setSpace] = useState('timeline');
  const [itemsBySpace, setItemsBySpace] = useState({});
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const showToast = useCallback((title, message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 6000);
  }, []);

  const refreshSpace = useCallback(async (s) => {
    try {
      const list = await fetchItems(s);
      setItemsBySpace(prev => ({
        ...prev,
        [s]: list.map(it => ({ ...it, imageUrl: it.imageUrl ? imageUrl(it.imageUrl) : null }))
      }));
    } catch (err) {
      showToast("Couldn't load", err.message);
    }
  }, [showToast]);

  const refreshTasks = useCallback(async () => {
    try {
      setTasks(await fetchTasks());
    } catch (err) {
      showToast("Couldn't load", err.message);
    }
  }, [showToast]);

  useEffect(() => {
    if (!email) return;
    SPACE_TYPES.forEach(refreshSpace);
    refreshTasks();
  }, [email, refreshSpace, refreshTasks]);

  // Reminder loop - checks every 20s while the tab is open
  useEffect(() => {
    if (!email) return;
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach(t => {
        const when = new Date(t.when);
        if (!t.done && !t.notified && when <= now) {
          patchTask(t.id, { notified: true }).then(() => refreshTasks());
          fireReminder(t.title);
        }
      });
    }, 20000);
    return () => clearInterval(interval);
  }, [email, tasks, refreshTasks]);

  function fireReminder(title) {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Prep Deck', { body: title });
    }
    showToast('Time to do this', title);
  }

  function enableNotifications() {
    if (typeof Notification === 'undefined') {
      showToast('Not supported', "This browser doesn't support notifications.");
      return;
    }
    Notification.requestPermission().then(perm => {
      setNotifPermission(perm);
      if (perm === 'granted') showToast('Reminders on', "You'll get a notification while this tab is open.");
    });
  }

  function handleLogout() {
    setToken(null);
    setStoredEmail(null);
    setEmail(null);
  }

  async function handleSaveItem(data, file) {
    try {
      await createItem(space, data, file);
      await refreshSpace(space);
      setModalOpen(false);
    } catch (err) {
      showToast("Couldn't save", err.message);
    }
  }

  async function handleSaveTask(data) {
    try {
      await createTask(data);
      await refreshTasks();
      setModalOpen(false);
    } catch (err) {
      showToast("Couldn't save", err.message);
    }
  }

  async function handleDeleteItem(item) {
    try {
      await removeItem(space, item.id);
      await refreshSpace(space);
    } catch (err) {
      showToast("Couldn't delete", err.message);
    }
  }

  if (!email) return <Login onAuthed={setEmail} />;

  const counts = {
    timeline: tasks.filter(t => !t.done).length || '',
    ...Object.fromEntries(SPACE_TYPES.map(s => [s, (itemsBySpace[s] || []).length || '']))
  };

  return (
    <div id="app">
      <Sidebar current={space} onSwitch={setSpace} counts={counts} email={email} onLogout={handleLogout} />
      <div className="main">
        {notifPermission !== 'granted' && notifPermission !== 'unsupported' && (
          <div className="notif-banner">
            <span>Turn on reminders so timeline tasks notify you while this tab is open.</span>
            <button className="btn-secondary" onClick={enableNotifications}>Enable reminders</button>
          </div>
        )}

        {space === 'timeline' ? (
          <Timeline
            tasks={tasks}
            onToggle={t => patchTask(t.id, { done: !t.done }).then(refreshTasks)}
            onDelete={t => removeTask(t.id).then(refreshTasks)}
            onAdd={() => setModalOpen(true)}
          />
        ) : (
          <SpaceView
            space={space}
            items={itemsBySpace[space] || []}
            onDelete={handleDeleteItem}
            onAdd={() => setModalOpen(true)}
          />
        )}
      </div>

      {modalOpen && (
        <AddModal
          space={space}
          onClose={() => setModalOpen(false)}
          onSaveItem={handleSaveItem}
          onSaveTask={handleSaveTask}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
