import mongoose, { Document, Schema } from 'mongoose';

export interface IMentorAvailability extends Document {
  mentor: mongoose.Types.ObjectId;
  weeklySchedule: {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    timeSlots: {
      startTime: string; // HH:MM format
      endTime: string;   // HH:MM format
      isAvailable: boolean;
    }[];
  }[];
  exceptions: {
    date: Date;
    isAvailable: boolean;
    timeSlots?: {
      startTime: string;
      endTime: string;
    }[];
    reason?: string;
  }[];
  timezone: string;
  maxSessionsPerDay: number;
  sessionDuration: number; // in minutes
}

const mentorAvailabilitySchema = new Schema<IMentorAvailability>({
  mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  weeklySchedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    timeSlots: [{
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      isAvailable: { type: Boolean, default: true }
    }]
  }],
  exceptions: [{
    date: { type: Date, required: true },
    isAvailable: { type: Boolean, required: true },
    timeSlots: [{
      startTime: String,
      endTime: String
    }],
    reason: String
  }],
  timezone: { type: String, default: 'UTC' },
  maxSessionsPerDay: { type: Number, default: 3 },
  sessionDuration: { type: Number, default: 60 }
}, { timestamps: true });

export default mongoose.model<IMentorAvailability>('MentorAvailability', mentorAvailabilitySchema);