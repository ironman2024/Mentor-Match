import mongoose, { Schema, Document } from 'mongoose';

export interface IUserStats extends Document {
  user: mongoose.Types.ObjectId;
  level: number;
  experience: number;
  totalPoints: number;
  mentorshipScore: number;
  projectScore: number;
  collaborationScore: number;
  contributionScore: number;
  skillEndorsements: Map<string, number>;
  achievements: Array<{
    id: string;
    unlockedAt: Date;
  }>;
  activityStreak: {
    current: number;
    longest: number;
    lastActive: Date;
  };
  streaks: {
    current: number;
    longest: number;
    lastActivity: Date;
  };
  monthlyStats: Array<{
    month: string;
    points: number;
    projects: number;
    events: number;
    mentorships: number;
  }>;
  projectsCreated: number;
  projectsCompleted: number;
  eventsAttended: number;
  mentorshipSessions: number;
  mentorshipStats: {
    sessionsCompleted: number;
    averageRating: number;
    studentsHelped: number;
    topSkills: Array<{
      skill: string;
      endorsements: number;
    }>;
  };
  teamStats: {
    projectsCompleted: number;
    teamsLed: number;
    teamMemberships: number;
    averageTeamRating: number;
  };
}

const userStatsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  mentorshipScore: { type: Number, default: 0 },
  projectScore: { type: Number, default: 0 },
  collaborationScore: { type: Number, default: 0 },
  contributionScore: { type: Number, default: 0 },
  skillEndorsements: { type: Map, of: Number, default: new Map() },
  achievements: [{
    id: String,
    unlockedAt: Date
  }],
  activityStreak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  },
  streaks: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now }
  },
  monthlyStats: [{
    month: String,
    points: { type: Number, default: 0 },
    projects: { type: Number, default: 0 },
    events: { type: Number, default: 0 },
    mentorships: { type: Number, default: 0 }
  }],
  projectsCreated: { type: Number, default: 0 },
  projectsCompleted: { type: Number, default: 0 },
  eventsAttended: { type: Number, default: 0 },
  mentorshipSessions: { type: Number, default: 0 },
  mentorshipStats: {
    sessionsCompleted: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    studentsHelped: { type: Number, default: 0 },
    topSkills: [{
      skill: String,
      endorsements: Number
    }]
  },
  teamStats: {
    projectsCompleted: { type: Number, default: 0 },
    teamsLed: { type: Number, default: 0 },
    teamMemberships: { type: Number, default: 0 },
    averageTeamRating: { type: Number, default: 0 }
  }
});

export default mongoose.model<IUserStats>('UserStats', userStatsSchema);