import mongoose, { Document, Schema } from 'mongoose';

export interface IMentorReview extends Document {
  mentor: mongoose.Types.ObjectId;
  mentee: mongoose.Types.ObjectId;
  session: mongoose.Types.ObjectId;
  rating: number;
  review: string;
  categories: {
    communication: number;
    expertise: number;
    helpfulness: number;
    availability: number;
  };
  isAnonymous: boolean;
  isVerified: boolean;
  helpfulVotes: number;
  reportCount: number;
  status: 'active' | 'hidden' | 'reported';
}

const mentorReviewSchema = new Schema<IMentorReview>({
  mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mentee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: Schema.Types.ObjectId, ref: 'MentorshipSession', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true, maxlength: 1000 },
  categories: {
    communication: { type: Number, required: true, min: 1, max: 5 },
    expertise: { type: Number, required: true, min: 1, max: 5 },
    helpfulness: { type: Number, required: true, min: 1, max: 5 },
    availability: { type: Number, required: true, min: 1, max: 5 }
  },
  isAnonymous: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: true },
  helpfulVotes: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'hidden', 'reported'], default: 'active' }
}, { timestamps: true });

mentorReviewSchema.index({ mentor: 1, mentee: 1, session: 1 }, { unique: true });

export default mongoose.model<IMentorReview>('MentorReview', mentorReviewSchema);