import mongoose, { Document, Schema } from 'mongoose';

export interface IScheduledSession extends Document {
  mentorshipRequest: mongoose.Types.ObjectId;
  mentor: mongoose.Types.ObjectId;
  mentee: mongoose.Types.ObjectId;
  scheduledDate: Date;
  duration: number; // in minutes
  meetingType: 'online' | 'offline';
  meetingLink?: string;
  location?: string;
  agenda: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  reminderSent: boolean;
  notes?: string;
  feedback?: {
    mentorFeedback: string;
    menteeFeedback: string;
    mentorRating: number;
    menteeRating: number;
  };
  rescheduleHistory: {
    originalDate: Date;
    newDate: Date;
    reason: string;
    rescheduledBy: mongoose.Types.ObjectId;
    rescheduledAt: Date;
  }[];
}

const scheduledSessionSchema = new Schema<IScheduledSession>({
  mentorshipRequest: { type: Schema.Types.ObjectId, ref: 'MentorshipRequest', required: true },
  mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mentee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledDate: { type: Date, required: true },
  duration: { type: Number, required: true, default: 60 },
  meetingType: { type: String, enum: ['online', 'offline'], required: true },
  meetingLink: String,
  location: String,
  agenda: { type: String, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  reminderSent: { type: Boolean, default: false },
  notes: String,
  feedback: {
    mentorFeedback: String,
    menteeFeedback: String,
    mentorRating: { type: Number, min: 1, max: 5 },
    menteeRating: { type: Number, min: 1, max: 5 }
  },
  rescheduleHistory: [{
    originalDate: { type: Date, required: true },
    newDate: { type: Date, required: true },
    reason: { type: String, required: true },
    rescheduledBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rescheduledAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model<IScheduledSession>('ScheduledSession', scheduledSessionSchema);