import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  description: string;
  category: string;
  projectType?: 'hackathon' | 'competition' | 'academic' | 'startup';
  requiredSkills: string[];
  maxMembers: number;
  members: mongoose.Types.ObjectId[];
  currentMembers?: {
    user: mongoose.Types.ObjectId;
    role: string;
    joinedAt: Date;
    contribution?: string;
  }[];
  leader: mongoose.Types.ObjectId;
  status: 'forming' | 'recruiting' | 'full' | 'active' | 'completed';
  deadline?: Date;
  competition?: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  progress?: {
    milestones: Array<{
      title: string;
      description: string;
      completed: boolean;
      dueDate?: Date;
    }>;
    completionPercentage: number;
  };
  teamDynamics?: {
    communicationStyle: 'formal' | 'casual' | 'mixed';
    workingHours: 'flexible' | 'fixed' | 'timezone-specific';
    meetingFrequency: 'daily' | 'weekly' | 'bi-weekly';
  };
  achievements?: {
    type: 'competition-win' | 'project-completion' | 'milestone';
    title: string;
    date: Date;
    description: string;
  }[];
  createdAt: Date;
}

const TeamSchema = new Schema<ITeam>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  projectType: { type: String, enum: ['hackathon', 'competition', 'academic', 'startup'] },
  requiredSkills: [{ type: String }],
  maxMembers: { type: Number, default: 5 },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  currentMembers: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
    contribution: String
  }],
  leader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['forming', 'recruiting', 'full', 'active', 'completed'], default: 'forming' },
  deadline: { type: Date },
  competition: { type: Schema.Types.ObjectId, ref: 'Competition' },
  project: { type: Schema.Types.ObjectId, ref: 'Project' },
  progress: {
    milestones: [{
      title: { type: String, required: true },
      description: { type: String, required: true },
      completed: { type: Boolean, default: false },
      dueDate: Date
    }],
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 }
  },
  teamDynamics: {
    communicationStyle: { type: String, enum: ['formal', 'casual', 'mixed'], default: 'mixed' },
    workingHours: { type: String, enum: ['flexible', 'fixed', 'timezone-specific'], default: 'flexible' },
    meetingFrequency: { type: String, enum: ['daily', 'weekly', 'bi-weekly'], default: 'weekly' }
  },
  achievements: [{
    type: { type: String, enum: ['competition-win', 'project-completion', 'milestone'] },
    title: String,
    date: Date,
    description: String
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITeam>('Team', TeamSchema);