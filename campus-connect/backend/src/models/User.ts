import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'student' | 'alumni' | 'faculty' | 'club';
  name: string;
  skills: {
    name: string;
    proficiency: number;
    endorsements: {
      user: mongoose.Schema.Types.ObjectId;
      comment: string;
    }[];
  }[];
  bio?: string;
  avatar?: string;
  resume?: string;
  linkedin?: string;
  github?: string;
  yearOfGraduation?: number;
  department?: string;
  achievements: {
    type: 'project' | 'hackathon' | 'certification' | 'mentorship';
    title: string;
    description: string;
    date: Date;
    verificationUrl: string;
  }[];
  experiences: {
    title: string;
    company: string;
    startDate: Date;
    endDate?: Date;
    description: string;
  }[];
  projects: {
    title: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate: Date;
    endDate?: Date;
  }[];
  reputation: number;
  badges: string[];
  mentorshipAvailability?: boolean;
  areasOfExpertise: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  mentorRating: number;
  totalRatings: number;
  messageCount: number;
  mentorshipStats: {
    successfulMentorships: number;
    activeProjects: number;
    menteeRatings: {
      mentee: mongoose.Schema.Types.ObjectId;
      rating: number;
      feedback: string;
      date: Date;
    }[];
  };
  teamPreferences: {
    preferredRoles: string[];
    projectInterests: string[];
    availability: {
      weekdays: boolean;
      weekends: boolean;
      timeSlots: string[];
    };
  };
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['student', 'alumni', 'faculty', 'club'] 
  },
  name: { type: String, required: true },
  skills: {
    type: [{
      name: String,
      proficiency: { type: Number, min: 1, max: 5 }, // 1: Beginner, 5: Expert
      endorsements: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: String
      }]
    }],
    default: []
  },
  bio: String,
  avatar: String,
  resume: String,
  linkedin: String,
  github: String,
  yearOfGraduation: Number,
  department: String,
  achievements: [{
    type: { type: String, enum: ['project', 'hackathon', 'certification', 'mentorship'] },
    title: String,
    description: String,
    date: Date,
    verificationUrl: String
  }],
  experiences: [{
    title: String,
    company: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    url: String,
    startDate: Date,
    endDate: Date
  }],
  reputation: { type: Number, default: 0 },
  badges: [String],
  mentorshipAvailability: Boolean,
  areasOfExpertise: [String],
  mentorRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  messageCount: { type: Number, default: 0 },
  mentorshipStats: {
    successfulMentorships: { type: Number, default: 0 },
    activeProjects: { type: Number, default: 0 },
    menteeRatings: [{ 
      mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: Number,
      feedback: String,
      date: { type: Date, default: Date.now }
    }]
  },
  teamPreferences: {
    preferredRoles: [String],
    projectInterests: [String],
    availability: {
      weekdays: Boolean,
      weekends: Boolean,
      timeSlots: [String]
    }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
