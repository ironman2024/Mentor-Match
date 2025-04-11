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
  technicalDetails: {
    requiredSkills: string[];
    prerequisites: string[];
    complexity: 'beginner' | 'intermediate' | 'advanced';
    domain: string[];
    estimatedDuration: number; // in weeks
    techStack: string[];
  };
  projectType: 'software' | 'hardware' | 'hybrid';
  resourceLinks: {
    title: string;
    url: string;
    type: 'documentation' | 'tutorial' | 'github' | 'other';
  }[];
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
  githubLink: String,
  technicalDetails: {
    requiredSkills: [String],
    prerequisites: [String],
    complexity: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true
    },
    domain: [String],
    estimatedDuration: Number,
    techStack: [String]
  },
  projectType: {
    type: String,
    enum: ['software', 'hardware', 'hybrid'],
    required: true
  },
  resourceLinks: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['documentation', 'tutorial', 'github', 'other']
    }
  }]
}, { timestamps: true });

export default mongoose.model<IProject>('Project', projectSchema);
