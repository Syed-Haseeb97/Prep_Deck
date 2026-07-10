import { Router } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { Readable } from 'stream';
import Item from '../models/Item.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4.5 * 1024 * 1024 }
});

function bucket() {
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'screenshots' });
}

// List items for a space
router.get('/:space', async (req, res) => {
  const items = await Item.find({ userId: req.userId, space: req.params.space }).sort({ createdAt: -1 });
  res.json(items.map(i => ({
    id: i._id,
    title: i.title,
    body: i.body,
    url: i.url,
    imageUrl: i.imageFileId ? `/api/items/image/${i.imageFileId}` : null,
    createdAt: i.createdAt
  })));
});

// Create item (screenshots use multipart/form-data with a "file" field; others use JSON)
router.post('/:space', upload.single('file'), async (req, res) => {
  const { space } = req.params;
  const { title, body, url } = req.body;
  if (!title) return res.status(400).json({ error: 'Give it a title.' });

  let imageFileId = null;
  if (space === 'screenshots' && req.file) {
    imageFileId = await new Promise((resolve, reject) => {
      const uploadStream = bucket().openUploadStream(req.file.originalname, {
        metadata: { userId: req.userId }
      });
      Readable.from(req.file.buffer).pipe(uploadStream)
        .on('error', reject)
        .on('finish', () => resolve(uploadStream.id));
    });
  }

  const item = await Item.create({ userId: req.userId, space, title, body, url, imageFileId });
  res.json({ id: item._id });
});

// Stream an image back out
router.get('/image/:fileId', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    const files = await mongoose.connection.db.collection('screenshots.files').findOne({ _id: fileId });
    if (!files || String(files.metadata?.userId) !== req.userId) {
      return res.status(404).end();
    }
    res.set('Content-Type', files.contentType || 'image/jpeg');
    bucket().openDownloadStream(fileId).pipe(res);
  } catch (err) {
    res.status(404).end();
  }
});

// Delete item
router.delete('/:space/:id', async (req, res) => {
  const item = await Item.findOne({ _id: req.params.id, userId: req.userId });
  if (!item) return res.status(404).json({ error: 'Not found.' });
  if (item.imageFileId) {
    try { await bucket().delete(item.imageFileId); } catch (e) { /* ignore */ }
  }
  await item.deleteOne();
  res.json({ ok: true });
});

export default router;
