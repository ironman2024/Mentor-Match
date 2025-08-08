import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string;
  role: 'student' | 'alumni' | 'faculty' | 'club';
  name: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  googleId?: string;
  authProvider: 'local' | 'google';
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
    images?: string[];
    collaborators?: mongoose.Schema.Types.ObjectId[];
    status: 'completed' | 'ongoing' | 'planned';
    visibility: 'public' | 'private' | 'team-only';
  }[];
  portfolio: {
    showcaseProjects: mongoose.Schema.Types.ObjectId[];
    certifications: {
      name: string;
      issuer: string;
      credentialId?: string;
      issueDate: Date;
      expiryDate?: Date;
      verificationUrl?: string;
    }[];
    testimonials: {
      from: mongoose.Schema.Types.ObjectId;
      content: string;
      relationship: 'mentor' | 'teammate' | 'mentee' | 'peer';
      date: Date;
      verified: boolean;
    }[];
  };
  reputation: number;
  badges: string[];
  mentorshipAvailability?: boolean;
  areasOfExpertise: {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsOfExperience: number;
    certifications?: string[];
    endorsements: {
      user: mongoose.Schema.Types.ObjectId;
      comment: string;
      date: Date;
    }[];
  }[];
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
  password: { 
    type: String, 
    required: function(this: any) { 
      return this.authProvider === 'local'; 
    } 
  },
  role: { 
    type: String, 
    required: true, 
    enum: ['student', 'alumni', 'faculty', 'club'] 
  },
  name: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  googleId: String,
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
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
    endDate: Date,
    images: [String],
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['completed', 'ongoing', 'planned'], default: 'ongoing' },
    visibility: { type: String, enum: ['public', 'private', 'team-only'], default: 'public' }
  }],
  portfolio: {
    showcaseProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    certifications: [{
      name: String,
      issuer: String,
      credentialId: String,
      issueDate: Date,
      expiryDate: Date,
      verificationUrl: String
    }],
    testimonials: [{
      from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String,
      relationship: { type: String, enum: ['mentor', 'teammate', 'mentee', 'peer'] },
      date: { type: Date, default: Date.now },
      verified: { type: Boolean, default: false }
    }]
  },
  reputation: { type: Number, default: 0 },
  badges: [String],
  mentorshipAvailability: Boolean,
  areasOfExpertise: [{
    name: { type: String, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
    yearsOfExperience: { type: Number, default: 0 },
    certifications: [String],
    endorsements: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      comment: String,
      date: { type: Date, default: Date.now }
    }]
  }],
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
  },
  teamStats: {
    teamsJoined: { type: Number, default: 0 },
    teamsLed: { type: Number, default: 0 },
    hackathonWins: { type: Number, default: 0 },
    competitionWins: { type: Number, default: 0 },
    perfectTeamRatings: { type: Number, default: 0 },
    averageTeamRating: { type: Number, default: 0 },
    totalTeamRatings: { type: Number, default: 0 }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  if (this.authProvider === 'local') {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
