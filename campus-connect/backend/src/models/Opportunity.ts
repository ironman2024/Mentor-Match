import mongoose, { Document } from 'mongoose';

export interface IOpportunity extends Document {
  title: string;
  description: string;
  type: 'internship' | 'job' | 'project' | 'research';
  author: mongoose.Types.ObjectId;
  requirements?: string[];
  location?: string;
  deadline?: Date;
  isActive: boolean;
}

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['internship', 'job', 'project', 'research'],
    required: true
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requirements: [String],
  location: String,
  deadline: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IOpportunity>('Opportunity', opportunitySchema);