import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'student' | 'alumni' | 'faculty' | 'club';
  name: string;
  skills: string[];
  bio?: string;
  // New fields
  avatar?: string;
  linkedin?: string;
  github?: string;
  yearOfGraduation?: number;
  department?: string;
  achievements: string[];
  experiences: {
    title: string;
    company: string;
    startDate: Date;
    endDate?: Date;
    description: string;
  }[];
  reputation: number;
  badges: string[];
  mentorshipAvailability?: boolean;
  areasOfExpertise: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
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
  skills: [String],
  bio: String,
  avatar: String,
  linkedin: String,
  github: String,
  yearOfGraduation: Number,
  department: String,
  achievements: [String],
  experiences: [{
    title: String,
    company: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  reputation: { type: Number, default: 0 },
  badges: [String],
  mentorshipAvailability: Boolean,
  areasOfExpertise: [String]
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
