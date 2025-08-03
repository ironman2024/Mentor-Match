import mongoose, { Document } from 'mongoose';

export interface IPortfolio extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description: string;
  visibility: 'public' | 'private' | 'mentors-only';
  sections: {
    type: 'project' | 'achievement' | 'skill-demo' | 'certification' | 'testimonial';
    title: string;
    content: string;
    media: {
      type: 'image' | 'video' | 'document' | 'link';
      url: string;
      caption?: string;
    }[];
    skills: string[];
    order: number;
  }[];
  skillShowcase: {
    skill: string;
    proficiencyLevel: number;
    projects: mongoose.Types.ObjectId[];
    endorsements: {
      endorser: mongoose.Types.ObjectId;
      comment: string;
      date: Date;
    }[];
    certifications: {
      name: string;
      issuer: string;
      url?: string;
      date: Date;
    }[];
  }[];
  views: number;
  likes: mongoose.Types.ObjectId[];
  featured: boolean;
}

const portfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  visibility: {
    type: String,
    enum: ['public', 'private', 'mentors-only'],
    default: 'public'
  },
  sections: [{
    type: {
      type: String,
      enum: ['project', 'achievement', 'skill-demo', 'certification', 'testimonial'],
      required: true
    },
    title: String,
    content: String,
    media: [{
      type: { type: String, enum: ['image', 'video', 'document', 'link'] },
      url: String,
      caption: String
    }],
    skills: [String],
    order: Number
  }],
  skillShowcase: [{
    skill: String,
    proficiencyLevel: { type: Number, min: 1, max: 5 },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    endorsements: [{
      endorser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      comment: String,
      date: { type: Date, default: Date.now }
    }],
    certifications: [{
      name: String,
      issuer: String,
      url: String,
      date: Date
    }]
  }],
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  featured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IPortfolio>('Portfolio', portfolioSchema);