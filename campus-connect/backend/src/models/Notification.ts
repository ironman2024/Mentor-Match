import mongoose, { Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: 'mentorship_request' | 'mentorship_accepted' | 'mentorship_rejected' | 'event_registration' | 'general' | 'badge_earned' | 'level_up' | 'achievement' | 'digest';
  title: string;
  message: string;
  read: boolean;
  relatedEvent?: mongoose.Types.ObjectId;
  metadata?: {
    badgeId?: mongoose.Types.ObjectId;
    badgeName?: string;
    badgeIcon?: string;
    points?: number;
    rarity?: string;
    newLevel?: number;
    streakDays?: number;
    leaderboardType?: string;
    rank?: number;
    previousRank?: number;
    type?: string;
  };
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
    enum: ['mentorship_request', 'mentorship_accepted', 'mentorship_rejected', 'event_registration', 'general', 'badge_earned', 'level_up', 'achievement', 'digest'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  metadata: {
    badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
    badgeName: String,
    badgeIcon: String,
    points: Number,
    rarity: String,
    newLevel: Number,
    streakDays: Number,
    leaderboardType: String,
    rank: Number,
    previousRank: Number,
    type: String
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<INotification>('Notification', notificationSchema);
