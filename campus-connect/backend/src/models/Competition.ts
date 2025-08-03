import mongoose, { Document } from 'mongoose';

export interface ICompetition extends Document {
  title: string;
  description: string;
  type: 'hackathon' | 'coding-contest' | 'innovation-challenge' | 'startup-pitch';
  organizer: mongoose.Types.ObjectId;
  registrationDeadline: Date;
  startDate: Date;
  endDate: Date;
  maxTeamSize: number;
  minTeamSize: number;
  requiredSkills: string[];
  prizes: {
    position: number;
    title: string;
    description: string;
    value?: string;
  }[];
  participants: {
    user: mongoose.Types.ObjectId;
    team?: mongoose.Types.ObjectId;
    registeredAt: Date;
  }[];
  status: 'upcoming' | 'registration-open' | 'ongoing' | 'completed';
  rules: string;
  resources: {
    title: string;
    url: string;
    type: 'documentation' | 'dataset' | 'api' | 'tool';
  }[];
}

const competitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['hackathon', 'coding-contest', 'innovation-challenge', 'startup-pitch'],
    required: true
  },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registrationDeadline: { type: Date, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  maxTeamSize: { type: Number, default: 5 },
  minTeamSize: { type: Number, default: 1 },
  requiredSkills: [String],
  prizes: [{
    position: Number,
    title: String,
    description: String,
    value: String
  }],
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    registeredAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['upcoming', 'registration-open', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  rules: String,
  resources: [{
    title: String,
    url: String,
    type: { type: String, enum: ['documentation', 'dataset', 'api', 'tool'] }
  }]
}, { timestamps: true });

export default mongoose.model<ICompetition>('Competition', competitionSchema);