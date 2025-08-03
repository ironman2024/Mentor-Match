import mongoose, { Document } from 'mongoose';

export interface IUserAchievement extends Document {
  user: mongoose.Schema.Types.ObjectId;
  badges: {
    badge: mongoose.Schema.Types.ObjectId;
    earnedAt: Date;
    progress?: number;
  }[];
  totalPoints: number;
  projectScore: number;
  mentorshipScore: number;
  contributionScore: number;
  activeStreaks: {
    type: string;
    count: number;
    lastUpdated: Date;
  }[];
  milestones: {
    name: string;
    achievedAt: Date;
    value: number;
  }[];
}

const userAchievementSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  badges: [{
    badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
    earnedAt: { type: Date, default: Date.now },
    progress: Number
  }],
  totalPoints: { type: Number, default: 0 },
  projectScore: { type: Number, default: 0 },
  mentorshipScore: { type: Number, default: 0 },
  contributionScore: { type: Number, default: 0 },
  activeStreaks: [{
    type: String,
    count: Number,
    lastUpdated: Date
  }],
  milestones: [{
    name: String,
    achievedAt: Date,
    value: Number
  }]
}, { timestamps: true });

export default mongoose.model<IUserAchievement>('UserAchievement', userAchievementSchema);
