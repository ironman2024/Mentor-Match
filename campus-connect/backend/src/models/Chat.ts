import mongoose, { Document } from 'mongoose';

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  messages: Array<{
    sender: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    readBy: mongoose.Types.ObjectId[];
  }>;
  type: 'direct' | 'group';
  groupName?: string;
  lastActivity: Date;
}

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  type: { type: String, enum: ['direct', 'group'], required: true },
  groupName: String,
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IChat>('Chat', chatSchema);
