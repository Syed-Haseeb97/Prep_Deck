import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  space: { type: String, enum: ['screenshots', 'notes', 'videos', 'links'], required: true, index: true },
  title: { type: String, required: true },
  body: { type: String },
  url: { type: String },
  imageFileId: { type: mongoose.Schema.Types.ObjectId }, // GridFS file id, screenshots only
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);
