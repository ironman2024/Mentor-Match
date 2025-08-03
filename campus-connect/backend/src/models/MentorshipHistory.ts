import mongoose, { Document, Schema } from 'mongoose';

export interface IMentorshipHistory extends Document {
  mentor: mongoose.Types.ObjectId;
  mentee: mongoose.Types.ObjectId;
  mentorshipRequest: mongoose.Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'terminated';
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  averageRating: number;
  goals: {
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    completedAt?: Date;
  }[];
  milestones: {
    title: string;
    description: string;
    achievedAt: Date;
    evidence?: string;
  }[];
  outcomes: {
    skillsImproved: string[];
    certificationsEarned: string[];
    projectsCompleted: string[];
    careerAdvancement?: string;
  };
  feedback: {
    finalMentorFeedback?: string;
    finalMenteeFeedback?: string;
    overallExperience: number;
    wouldRecommend: boolean;
  };
  tags: string[];
}

const mentorshipHistorySchema = new Schema<IMentorshipHistory>({
  mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mentee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mentorshipRequest: { type: Schema.Types.ObjectId, ref: 'MentorshipRequest', required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  status: { type: String, enum: ['active', 'completed', 'terminated'], default: 'active' },
  totalSessions: { type: Number, default: 0 },
  completedSessions: { type: Number, default: 0 },
  cancelledSessions: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  goals: [{
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    completedAt: Date
  }],
  milestones: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    achievedAt: { type: Date, required: true },
    evidence: String
  }],
  outcomes: {
    skillsImproved: [String],
    certificationsEarned: [String],
    projectsCompleted: [String],
    careerAdvancement: String
  },
  feedback: {
    finalMentorFeedback: String,
    finalMenteeFeedback: String,
    overallExperience: { type: Number, min: 1, max: 5 },
    wouldRecommend: { type: Boolean, default: true }
  },
  tags: [String]
}, { timestamps: true });

mentorshipHistorySchema.index({ mentor: 1, status: 1 });
mentorshipHistorySchema.index({ mentee: 1, status: 1 });

export default mongoose.model<IMentorshipHistory>('MentorshipHistory', mentorshipHistorySchema);