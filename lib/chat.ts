import mongoose from 'mongoose';

const ChatGroupSchema = new mongoose.Schema({
  name: String,
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // Links chat to event
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true }
});

const MessageSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatGroup', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'system'], default: 'text' },
  createdAt: { type: Date, default: Date.now }
});

export const ChatGroup = mongoose.models.ChatGroup || mongoose.model('ChatGroup', ChatGroupSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);