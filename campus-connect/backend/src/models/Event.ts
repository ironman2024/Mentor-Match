import mongoose, { Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  organizer: mongoose.Types.ObjectId;
  date: Date;
  location: string;
  type: 'hackathon' | 'workshop' | 'seminar' | 'competition';
  capacity: number;
  registeredParticipants: mongoose.Types.ObjectId[];
  status: 'upcoming' | 'ongoing' | 'completed';
  isTeamEvent: boolean;
  teamSize: number;
  registrations: Array<{
    teamName?: string;
    leader: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    registeredAt: Date;
  }>;
}

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  type: {
    type: String,
    enum: ['hackathon', 'workshop', 'seminar', 'competition'],
    required: true
  },
  capacity: { type: Number, required: true },
  registeredParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  isTeamEvent: { type: Boolean, default: false },
  teamSize: { type: Number, default: 1 },
  registrations: [{
    teamName: String,
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    registeredAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model<IEvent>('Event', eventSchema);
