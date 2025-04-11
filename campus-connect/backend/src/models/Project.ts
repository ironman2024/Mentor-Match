import mongoose, { Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  creator: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId[];
  status: 'open' | 'in-progress' | 'completed';
  technicalDetails: {
    requiredSkills: string[];
    prerequisites: string[];
    complexity: 'beginner' | 'intermediate' | 'advanced';
    domain: string[];
    estimatedDuration: number;
    techStack: string[];
  };
  projectType: 'software' | 'hardware' | 'hybrid';
  resourceLinks: Array<{
    title: string;
    url: string;
    type: 'documentation' | 'tutorial' | 'github' | 'other';
  }>;
  timeline?: {
    startDate: Date;
    endDate?: Date;
    milestones: Array<{
      title: string;
      description: string;
      dueDate: Date;
      completed: boolean;
    }>;
  };
}

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed'],
    default: 'open'
  },
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
  }],
  timeline: {
    startDate: Date,
    endDate: Date,
    milestones: [{
      title: String,
      description: String,
      dueDate: Date,
      completed: { type: Boolean, default: false }
    }]
  }
}, { timestamps: true });

export default mongoose.model<IProject>('Project', projectSchema);
