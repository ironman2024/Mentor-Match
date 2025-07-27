import express from 'express';
import { Question, Assessment } from '../models/Assessment';
import ProfessionalProfile from '../models/ProfessionalProfile';
import { auth } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create professional profile
router.post('/professional-profile', auth, upload.single('resume'), async (req, res) => {
  try {
    const { 
      education, 
      yearsOfExperience, 
      primaryDomain, 
      secondaryDomains,
      currentPosition,
      certifications 
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    const professionalProfile = new ProfessionalProfile({
      user: req.user.id,
      resumeUrl,
      education: JSON.parse(education),
      yearsOfExperience: parseInt(yearsOfExperience),
      primaryDomain,
      secondaryDomains: JSON.parse(secondaryDomains || '[]'),
      currentPosition: JSON.parse(currentPosition),
      certifications: JSON.parse(certifications || '[]'),
      assessmentStatus: [{ domain: primaryDomain, status: 'not-taken' }]
    });

    await professionalProfile.save();
    res.status(201).json({ 
      message: 'Professional profile created successfully',
      profile: professionalProfile 
    });
  } catch (error) {
    console.error('Error creating professional profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assessment questions for a domain
router.get('/questions/:domain', auth, async (req, res) => {
  try {
    const { domain } = req.params;
    
    // Get 10 random questions from the domain
    const questions = await Question.aggregate([
      { $match: { domain } },
      { $sample: { size: 10 } },
      { $project: { correctAnswer: 0, explanation: 0 } } // Hide correct answers
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this domain' });
    }

    res.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit assessment
router.post('/submit/:domain', auth, async (req, res) => {
  try {
    const { domain } = req.params;
    const { answers } = req.body; // Array of { questionId, selectedAnswer, timeSpent }

    // Get the correct answers
    const questionIds = answers.map((a: any) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    // Calculate score
    let correctAnswers = 0;
    const assessmentQuestions = answers.map((answer: any) => {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      const isCorrect = question?.correctAnswer === answer.selectedAnswer;
      if (isCorrect) correctAnswers++;

      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeSpent: answer.timeSpent || 0
      };
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const status = score >= 70 ? 'completed' : 'failed';

    // Save assessment
    const assessment = new Assessment({
      user: req.user.id,
      domain,
      questions: assessmentQuestions,
      score,
      totalQuestions: questions.length,
      status
    });

    await assessment.save();

    // Update professional profile
    await ProfessionalProfile.findOneAndUpdate(
      { user: req.user.id },
      {
        $set: {
          'assessmentStatus.$[elem].status': status === 'completed' ? 'passed' : 'failed',
          'assessmentStatus.$[elem].score': score,
          'assessmentStatus.$[elem].completedAt': new Date()
        }
      },
      {
        arrayFilters: [{ 'elem.domain': domain }]
      }
    );

    res.json({
      message: `Assessment ${status}`,
      score,
      totalQuestions: questions.length,
      correctAnswers,
      passed: status === 'completed'
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's assessment history
router.get('/history', auth, async (req, res) => {
  try {
    const assessments = await Assessment.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('-questions.questionId');

    res.json({ assessments });
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get professional profile
router.get('/professional-profile', auth, async (req, res) => {
  try {
    const profile = await ProfessionalProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Professional profile not found' });
    }
    res.json({ profile });
  } catch (error) {
    console.error('Error fetching professional profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;