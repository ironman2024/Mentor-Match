import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth';
import upload from '../middleware/upload';
import OpportunityApplication from '../models/OpportunityApplication';
import Opportunity from '../models/Opportunity';

interface AuthRequest extends express.Request {
  user?: {
    _id: string;
    id: string;
    role?: string;
  };
}

const router = express.Router();

// Apply for an opportunity
router.post('/', auth, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'additionalDocuments', maxCount: 5 }
]), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { opportunityId, coverLetter } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Check if opportunity exists and is active
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity || !opportunity.isActive) {
      return res.status(404).json({ message: 'Opportunity not found or inactive' });
    }

    // Check if user already applied
    const existingApplication = await OpportunityApplication.findOne({
      opportunity: opportunityId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this opportunity' });
    }

    const applicationData: any = {
      opportunity: opportunityId,
      applicant: req.user._id,
      coverLetter
    };

    if (files.resume) {
      applicationData.resume = files.resume[0].path;
    }

    if (files.additionalDocuments) {
      applicationData.additionalDocuments = files.additionalDocuments.map(file => file.path);
    }

    const application = new OpportunityApplication(applicationData);
    await application.save();

    await application.populate([
      { path: 'opportunity', select: 'title type' },
      { path: 'applicant', select: 'name email' }
    ]);

    res.status(201).json(application);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get applications for a specific opportunity (for opportunity authors)
router.get('/opportunity/:opportunityId', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { opportunityId } = req.params;

    // Verify user is the author of the opportunity
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (opportunity.author.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to view applications' });
    }

    const applications = await OpportunityApplication.find({ opportunity: opportunityId })
      .populate('applicant', 'name email userProfile')
      .sort({ applicationDate: -1 });

    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's applications
router.get('/my-applications', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const applications = await OpportunityApplication.find({ applicant: req.user._id })
      .populate('opportunity', 'title type author deadline')
      .populate({
        path: 'opportunity',
        populate: {
          path: 'author',
          select: 'name'
        }
      })
      .sort({ applicationDate: -1 });

    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update application status (for opportunity authors)
router.patch('/:applicationId/status', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { applicationId } = req.params;
    const { status, reviewNotes } = req.body;

    const application = await OpportunityApplication.findById(applicationId)
      .populate('opportunity');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify user is the author of the opportunity
    const opportunity = application.opportunity as any;
    if (opportunity.author.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    application.reviewedBy = new mongoose.Types.ObjectId(req.user._id);
    application.reviewDate = new Date();
    if (reviewNotes) {
      application.reviewNotes = reviewNotes;
    }

    await application.save();
    await application.populate('applicant', 'name email');

    res.json(application);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Withdraw application
router.patch('/:applicationId/withdraw', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { applicationId } = req.params;

    const application = await OpportunityApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.applicant.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to withdraw this application' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Can only withdraw pending applications' });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json(application);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;