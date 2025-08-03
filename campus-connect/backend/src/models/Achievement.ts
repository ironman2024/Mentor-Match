import mongoose, { Document } from 'mongoose';

export interface IAchievement extends Document {
  user: mongoose.Types.ObjectId;
  badge: mongoose.Types.ObjectId;
  earnedAt: Date;
  progress: number;
  isCompleted: boolean;
  metadata?: {
    projectId?: mongoose.Types.ObjectId;
    eventId?: mongoose.Types.ObjectId;
    mentorshipId?: mongoose.Types.ObjectId;
    value?: number;
  };
}

const achievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  earnedAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  metadata: {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    mentorshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'MentorshipSession' },
    value: Number
  }
}, { timestamps: true });

achievementSchema.index({ user: 1, badge: 1 }, { unique: true });

export default mongoose.model<IAchievement>('Achievement', achievementSchema);