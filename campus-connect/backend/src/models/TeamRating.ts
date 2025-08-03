import mongoose, { Document } from 'mongoose';

export interface ITeamRating extends Document {
  team: mongoose.Types.ObjectId;
  rater: mongoose.Types.ObjectId;
  rated: mongoose.Types.ObjectId;
  rating: number;
  feedback: string;
  categories: {
    communication: number;
    technicalSkills: number;
    reliability: number;
    collaboration: number;
  };
  project: mongoose.Types.ObjectId;
}

const teamRatingSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rated: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  feedback: { type: String, required: true },
  categories: {
    communication: { type: Number, min: 1, max: 5, required: true },
    technicalSkills: { type: Number, min: 1, max: 5, required: true },
    reliability: { type: Number, min: 1, max: 5, required: true },
    collaboration: { type: Number, min: 1, max: 5, required: true }
  },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
}, { timestamps: true });

export default mongoose.model<ITeamRating>('TeamRating', teamRatingSchema);