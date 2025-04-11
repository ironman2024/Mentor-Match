import mongoose, { Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: 'mentorship_request' | 'mentorship_accepted' | 'event_registration' | 'general';
  title: string;
  message: string;
  read: boolean;
  relatedEvent?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['mentorship_request', 'mentorship_accepted', 'event_registration', 'general'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<INotification>('Notification', notificationSchema);
