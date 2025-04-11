import mongoose, { Document } from 'mongoose';

export interface IUserProfile extends Document {
  user: mongoose.Types.ObjectId;
  department?: string;
  yearOfGraduation?: string;
  headline?: string;
  bio?: string;
  skills: string[];
  experiences: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description?: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    startYear: number;
    endYear?: number;
    current: boolean;
  }>;
  certifications: Array<{
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate?: Date;
    credentialUrl?: string;
  }>;
  achievements: Array<{
    title: string;
    date: Date;
    description?: string;
  }>;
  socialLinks: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
}

const userProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String },
  yearOfGraduation: { type: String },
  experiences: [{
    title: String,
    company: String,
    startDate: Date,
    endDate: Date,
    description: String
  }]
}, { timestamps: true });

// Add index for faster lookups
userProfileSchema.index({ user: 1 });

export default mongoose.model<IUserProfile>('UserProfile', userProfileSchema);
