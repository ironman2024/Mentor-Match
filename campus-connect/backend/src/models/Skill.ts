import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: 'technical' | 'soft' | 'domain' | 'language';
  description?: string;
  verified: boolean;
  popularity: number;
  relatedSkills: mongoose.Types.ObjectId[];
}

export interface IUserSkill extends Document {
  user: mongoose.Types.ObjectId;
  skill: mongoose.Types.ObjectId;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  endorsements: Array<{
    endorser: mongoose.Types.ObjectId;
    comment?: string;
    createdAt: Date;
  }>;
  projects: mongoose.Types.ObjectId[];
  verified: boolean;
}

const skillSchema = new Schema<ISkill>({
  name: { type: String, required: true, unique: true, trim: true },
  category: { 
    type: String, 
    enum: ['technical', 'soft', 'domain', 'language'], 
    required: true 
  },
  description: String,
  verified: { type: Boolean, default: false },
  popularity: { type: Number, default: 0 },
  relatedSkills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }]
}, { timestamps: true });

const userSkillSchema = new Schema<IUserSkill>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
  proficiencyLevel: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'], 
    required: true 
  },
  yearsOfExperience: { type: Number, min: 0, default: 0 },
  endorsements: [{
    endorser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  verified: { type: Boolean, default: false }
}, { timestamps: true });

userSkillSchema.index({ user: 1, skill: 1 }, { unique: true });
skillSchema.index({ name: 'text', description: 'text' });

export const Skill = mongoose.model<ISkill>('Skill', skillSchema);
export const UserSkill = mongoose.model<IUserSkill>('UserSkill', userSkillSchema);