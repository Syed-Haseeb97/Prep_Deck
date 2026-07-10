import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  when: { type: Date, required: true },
  tag: { type: String },
  done: { type: Boolean, default: false },
  notified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
