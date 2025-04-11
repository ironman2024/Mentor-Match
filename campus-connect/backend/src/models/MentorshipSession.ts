import mongoose, { Document } from 'mongoose';

export interface IMentorshipSession extends Document {
  mentor: mongoose.Types.ObjectId;
  mentee: mongoose.Types.ObjectId;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  topic: string;
  goals: string[];
  schedule: {
    startDate: Date;
    endDate?: Date;
    frequency: 'weekly' | 'biweekly' | 'monthly';
  };
  feedback?: {
    rating: number;
    comment: string;
    givenAt: Date;
  };
}

const mentorshipSessionSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'rejected'],
    default: 'pending'
  },
  topic: { type: String, required: true },
  goals: [String],
  schedule: {
    startDate: { type: Date, required: true },
    endDate: Date,
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      required: true
    }
  },
  feedback: {
    rating: Number,
    comment: String,
    givenAt: Date
  }
}, { timestamps: true });

export default mongoose.model<IMentorshipSession>('MentorshipSession', mentorshipSessionSchema);
