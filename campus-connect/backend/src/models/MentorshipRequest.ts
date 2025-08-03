import mongoose, { Document } from 'mongoose';

export interface IMentorshipRequest extends Document {
  mentee: mongoose.Types.ObjectId;
  mentor: mongoose.Types.ObjectId;
  projectContext?: mongoose.Types.ObjectId;
  requestType: 'general' | 'project-specific' | 'career-guidance' | 'skill-development';
  focusAreas: string[];
  duration: 'short-term' | 'medium-term' | 'long-term';
  preferredMeetingMode: 'online' | 'offline' | 'hybrid';
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  matchScore?: number;
  priority: 'low' | 'medium' | 'high';
  expectedOutcomes: string[];
  menteeBackground: string;
  urgency: boolean;
  preferredSchedule: {
    days: string[];
    timePreference: 'morning' | 'afternoon' | 'evening' | 'flexible';
  };
  scheduledSessions: {
    date: Date;
    duration: number;
    mode: 'online' | 'offline';
    status: 'scheduled' | 'completed' | 'cancelled';
    feedback?: {
      menteeRating: number;
      mentorRating: number;
      menteeComment: string;
      mentorComment: string;
    };
  }[];
}

const mentorshipRequestSchema = new mongoose.Schema({
  mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectContext: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  requestType: {
    type: String,
    enum: ['general', 'project-specific', 'career-guidance', 'skill-development'],
    required: true
  },
  focusAreas: [String],
  duration: {
    type: String,
    enum: ['short-term', 'medium-term', 'long-term'],
    required: true
  },
  preferredMeetingMode: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    default: 'online'
  },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
    default: 'pending'
  },
  matchScore: Number,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  expectedOutcomes: [String],
  menteeBackground: String,
  urgency: { type: Boolean, default: false },
  preferredSchedule: {
    days: [String],
    timePreference: { type: String, enum: ['morning', 'afternoon', 'evening', 'flexible'], default: 'flexible' }
  },
  scheduledSessions: [{
    date: Date,
    duration: Number,
    mode: { type: String, enum: ['online', 'offline'] },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
    feedback: {
      menteeRating: { type: Number, min: 1, max: 5 },
      mentorRating: { type: Number, min: 1, max: 5 },
      menteeComment: String,
      mentorComment: String
    }
  }]
}, { timestamps: true });

mentorshipRequestSchema.index({ mentor: 1, status: 1 });
mentorshipRequestSchema.index({ mentee: 1, status: 1 });

export default mongoose.model<IMentorshipRequest>('MentorshipRequest', mentorshipRequestSchema);