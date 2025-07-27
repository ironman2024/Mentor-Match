import mongoose, { Document } from 'mongoose';

export interface IProfessionalProfile extends Document {
  user: mongoose.Schema.Types.ObjectId;
  resumeUrl: string;
  education: {
    degree: string;
    institution: string;
    fieldOfStudy: string;
    startYear: number;
    endYear: number;
    grade?: string;
  }[];
  yearsOfExperience: number;
  primaryDomain: string;
  secondaryDomains: string[];
  currentPosition: {
    title: string;
    company: string;
    startDate: Date;
    description?: string;
  };
  certifications: {
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate?: Date;
    credentialUrl?: string;
  }[];
  assessmentStatus: {
    domain: string;
    status: 'not-taken' | 'passed' | 'failed';
    score?: number;
    completedAt?: Date;
  }[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: mongoose.Schema.Types.ObjectId;
  verificationNotes?: string;
}

const professionalProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  resumeUrl: { type: String, required: true },
  education: [{
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number, required: true },
    grade: String
  }],
  yearsOfExperience: { type: Number, required: true, min: 0 },
  primaryDomain: { 
    type: String, 
    required: true,
    enum: ['web-development', 'mobile-development', 'data-science', 'ai-ml', 'cybersecurity', 'cloud-computing', 'devops', 'blockchain', 'ui-ux', 'product-management']
  },
  secondaryDomains: [{
    type: String,
    enum: ['web-development', 'mobile-development', 'data-science', 'ai-ml', 'cybersecurity', 'cloud-computing', 'devops', 'blockchain', 'ui-ux', 'product-management']
  }],
  currentPosition: {
    title: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: Date, required: true },
    description: String
  },
  certifications: [{
    name: { type: String, required: true },
    issuingOrganization: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: Date,
    credentialUrl: String
  }],
  assessmentStatus: [{
    domain: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['not-taken', 'passed', 'failed'],
      default: 'not-taken'
    },
    score: Number,
    completedAt: Date
  }],
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verificationNotes: String
}, { timestamps: true });

export default mongoose.model<IProfessionalProfile>('ProfessionalProfile', professionalProfileSchema);