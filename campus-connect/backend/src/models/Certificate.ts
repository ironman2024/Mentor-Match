import mongoose, { Document } from 'mongoose';

export interface ICertificate extends Document {
  student: mongoose.Types.ObjectId;
  title: string;
  issuer: string;
  issueDate: Date;
  file: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: mongoose.Types.ObjectId;
  endorsements: Array<{
    user: mongoose.Types.ObjectId;
    comment: string;
    createdAt: Date;
  }>;
}

const certificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: Date, required: true },
  file: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  endorsements: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model<ICertificate>('Certificate', certificateSchema);
