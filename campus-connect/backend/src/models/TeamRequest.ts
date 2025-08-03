import mongoose, { Document } from 'mongoose';

export interface ITeamRequest extends Document {
  requester: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  skills: string[];
  expectedContribution: string;
}

const teamRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  skills: [String],
  expectedContribution: String
}, { timestamps: true });

export default mongoose.model<ITeamRequest>('TeamRequest', teamRequestSchema);