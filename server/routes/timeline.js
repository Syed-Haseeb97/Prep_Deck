import { Router } from 'express';
import Task from '../models/Task.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const tasks = await Task.find({ userId: req.userId }).sort({ when: 1 });
  res.json(tasks.map(t => ({
    id: t._id, title: t.title, when: t.when, tag: t.tag, done: t.done, notified: t.notified
  })));
});

router.post('/', async (req, res) => {
  const { title, when, tag } = req.body;
  if (!title || !when) return res.status(400).json({ error: 'Add a title and a time.' });
  const task = await Task.create({ userId: req.userId, title, when: new Date(when), tag });
  res.json({ id: task._id });
});

router.patch('/:id', async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
  if (!task) return res.status(404).json({ error: 'Not found.' });
  if (typeof req.body.done === 'boolean') task.done = req.body.done;
  if (typeof req.body.notified === 'boolean') task.notified = req.body.notified;
  await task.save();
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
  if (!task) return res.status(404).json({ error: 'Not found.' });
  await task.deleteOne();
  res.json({ ok: true });
});

export default router;
