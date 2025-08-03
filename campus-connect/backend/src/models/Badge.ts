import mongoose, { Document } from 'mongoose';

export interface IBadge extends Document {
  name: string;
  description: string;
  icon: string;
  category: 'mentorship' | 'project' | 'event' | 'skill' | 'collaboration' | 'achievement';
  criteria: {
    type: 'count' | 'rating' | 'completion' | 'streak' | 'milestone';
    target: number;
    metric: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  category: {
    type: String,
    enum: ['mentorship', 'project', 'event', 'skill', 'collaboration', 'achievement'],
    required: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['count', 'rating', 'completion', 'streak', 'milestone'],
      required: true
    },
    target: { type: Number, required: true },
    metric: { type: String, required: true }
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  points: { type: Number, default: 10 }
}, { timestamps: true });

export default mongoose.model<IBadge>('Badge', badgeSchema);