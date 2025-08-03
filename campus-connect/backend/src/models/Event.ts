import mongoose, { Document, Schema, model } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  organizer: mongoose.Types.ObjectId;
  date: Date;
  location: string;
  type: 'hackathon' | 'workshop' | 'seminar' | 'competition';
  capacity: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  isTeamEvent: boolean;
  teamSize: number;
  requiredSkills: string[];
  registrations: Array<{
    teamName?: string;
    leader: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    memberData?: Array<{ name: string; email: string; }>;
    memberEmails?: string[];
    registeredAt: Date;
  }>;
}

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  type: {
    type: String,
    enum: ['hackathon', 'workshop', 'seminar', 'competition'],
    required: true
  },
  capacity: { type: Number, required: true },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  isTeamEvent: { type: Boolean, default: false },
  teamSize: { type: Number, default: 1 },
  requiredSkills: [String],
  registrations: [{
    teamName: String,
    leader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    memberData: [{ name: String, email: String }],
    memberEmails: [String],
    registeredAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default model<IEvent>('Event', eventSchema);