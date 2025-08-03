import mongoose, { Document } from 'mongoose';

export interface IMentorshipSession extends Document {
  mentor: mongoose.Types.ObjectId;
  mentee: mongoose.Types.ObjectId;
  status: 'pending' | 'scheduled' | 'active' | 'completed' | 'cancelled' | 'rejected';
  topic: string;
  goals: string[];
  requestDetails?: {
    domain: string;
    projectDescription?: string;
    specificHelp: string;
    studentMessage: string;
    timeCommitment?: string;
    preferredMeetingType?: 'online' | 'offline' | 'both';
  };
  sessionType: 'one-time' | 'recurring';
  meetingDetails: {
    scheduledDate: Date;
    duration: number; // in minutes
    meetingLink?: string;
    location?: string;
    meetingType: 'online' | 'offline';
    actualStartTime?: Date;
    actualEndTime?: Date;
  };
  recurringSchedule?: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    endDate?: Date;
    totalSessions?: number;
    completedSessions: number;
  };
  sessionNotes?: {
    mentorNotes?: string;
    menteeNotes?: string;
    sharedNotes?: string;
    actionItems?: string[];
  };
  feedback?: {
    mentorFeedback?: {
      rating: number;
      comment: string;
      givenAt: Date;
    };
    menteeFeedback?: {
      rating: number;
      comment: string;
      givenAt: Date;
    };
  };
  attachments?: string[];
}

const mentorshipSessionSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'active', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  topic: { type: String, required: true },
  goals: [String],
  requestDetails: {
    domain: { type: String, required: true },
    projectDescription: String,
    specificHelp: { type: String, required: true },
    studentMessage: { type: String, required: true },
    timeCommitment: String,
    preferredMeetingType: {
      type: String,
      enum: ['online', 'offline', 'both'],
      default: 'online'
    }
  },
  sessionType: {
    type: String,
    enum: ['one-time', 'recurring'],
    default: 'one-time'
  },
  meetingDetails: {
    scheduledDate: { type: Date, required: true },
    duration: { type: Number, default: 60 },
    meetingLink: String,
    location: String,
    meetingType: {
      type: String,
      enum: ['online', 'offline'],
      default: 'online'
    },
    actualStartTime: Date,
    actualEndTime: Date
  },
  recurringSchedule: {
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly']
    },
    endDate: Date,
    totalSessions: Number,
    completedSessions: { type: Number, default: 0 }
  },
  sessionNotes: {
    mentorNotes: String,
    menteeNotes: String,
    sharedNotes: String,
    actionItems: [String]
  },
  feedback: {
    mentorFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      givenAt: Date
    },
    menteeFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      givenAt: Date
    }
  },
  attachments: [String]
}, { timestamps: true });

export default mongoose.model<IMentorshipSession>('MentorshipSession', mentorshipSessionSchema);
