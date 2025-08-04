import mongoose, { Document } from 'mongoose';

export interface IOpportunityApplication extends Document {
  opportunity: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  coverLetter?: string;
  resume?: string;
  additionalDocuments?: string[];
  applicationDate: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewDate?: Date;
  reviewNotes?: string;
}

const opportunityApplicationSchema = new mongoose.Schema({
  opportunity: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Opportunity', 
    required: true 
  },
  applicant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  coverLetter: String,
  resume: String,
  additionalDocuments: [String],
  applicationDate: { type: Date, default: Date.now },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reviewDate: Date,
  reviewNotes: String
}, { timestamps: true });

// Compound index to prevent duplicate applications
opportunityApplicationSchema.index({ opportunity: 1, applicant: 1 }, { unique: true });

export default mongoose.model<IOpportunityApplication>('OpportunityApplication', opportunityApplicationSchema);