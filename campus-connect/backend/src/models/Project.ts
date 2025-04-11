import mongoose, { Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  creator: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId[];
  skills: string[];
  status: 'open' | 'in-progress' | 'completed';
  startDate: Date;
  endDate?: Date;
  maxTeamSize: number;
  githubLink?: string;
}

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  skills: [String],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed'],
    default: 'open'
  },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  maxTeamSize: { type: Number, default: 5 },
  githubLink: String
}, { timestamps: true });

export default mongoose.model<IProject>('Project', projectSchema);
