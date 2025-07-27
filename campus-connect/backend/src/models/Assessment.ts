import mongoose, { Document } from 'mongoose';

export interface IQuestion extends Document {
  domain: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation?: string;
  tags: string[];
}

export interface IAssessment extends Document {
  user: mongoose.Schema.Types.ObjectId;
  domain: string;
  questions: {
    questionId: mongoose.Schema.Types.ObjectId;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number; // in seconds
  }[];
  score: number;
  totalQuestions: number;
  completedAt: Date;
  status: 'pending' | 'completed' | 'failed';
  passingScore: number;
}

const questionSchema = new mongoose.Schema({
  domain: { 
    type: String, 
    required: true,
    enum: ['web-development', 'mobile-development', 'data-science', 'ai-ml', 'cybersecurity', 'cloud-computing', 'devops', 'blockchain', 'ui-ux', 'product-management']
  },
  difficulty: { 
    type: String, 
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true, min: 0, max: 3 },
  explanation: String,
  tags: [String]
}, { timestamps: true });

const assessmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, required: true },
  questions: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedAnswer: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    timeSpent: { type: Number, default: 0 }
  }],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  passingScore: { type: Number, default: 70 }
}, { timestamps: true });

export const Question = mongoose.model<IQuestion>('Question', questionSchema);
export const Assessment = mongoose.model<IAssessment>('Assessment', assessmentSchema);