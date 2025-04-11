import mongoose, { Document } from 'mongoose';

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  type: 'general' | 'certificate' | 'project' | 'achievement';
  attachments?: string[];
  likes: mongoose.Types.ObjectId[];
  comments: {
    author: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  skills?: string[];
  certificateDetails?: {
    title: string;
    issuer: string;
    issueDate: Date;
    verificationUrl?: string;
  };
}

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['general', 'certificate', 'project', 'achievement'],
    default: 'general'
  },
  attachments: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  skills: [String],
  certificateDetails: {
    title: String,
    issuer: String,
    issueDate: Date,
    verificationUrl: String
  },
  image: { type: String }
}, { timestamps: true });

export default mongoose.model<IPost>('Post', postSchema);
