import mongoose, { Document } from 'mongoose';

export interface ILeaderboard extends Document {
  type: 'projects' | 'contributions' | 'mentorship' | 'overall' | 'monthly';
  period: 'all-time' | 'monthly' | 'weekly';
  rankings: {
    user: mongoose.Types.ObjectId;
    score: number;
    rank: number;
    metadata?: {
      projectsCount?: number;
      contributionScore?: number;
      mentorshipRating?: number;
      badgesCount?: number;
    };
  }[];
  lastUpdated: Date;
}

const leaderboardSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['projects', 'contributions', 'mentorship', 'overall', 'monthly'],
    required: true
  },
  period: {
    type: String,
    enum: ['all-time', 'monthly', 'weekly'],
    required: true
  },
  rankings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    rank: { type: Number, required: true },
    metadata: {
      projectsCount: Number,
      contributionScore: Number,
      mentorshipRating: Number,
      badgesCount: Number
    }
  }],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

leaderboardSchema.index({ type: 1, period: 1 }, { unique: true });

export default mongoose.model<ILeaderboard>('Leaderboard', leaderboardSchema);