import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import emailService from '../services/emailService';
import { AuthRequest } from '../types/auth';

class AuthController {
  // Register new user
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, role, department, yearOfGraduation } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      const user = new User({
        email,
        password,
        name,
        role,
        department,
        yearOfGraduation,
        authProvider: 'local'
      });

      await user.save();

      // Send verification email
      const emailSent = await emailService.sendVerificationEmail(email, name, user._id.toString());
      
      res.status(201).json({
        message: 'User registered successfully. Please check your email for verification.',
        emailSent,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  }

  // Login user
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if user is using local auth
      if (user.authProvider !== 'local') {
        return res.status(400).json({ 
          message: `Please login using ${user.authProvider}` 
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          avatar: user.avatar
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  }

  // Verify email
  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: 'Verification token is required' });
      }

      // Verify JWT token
      const decoded = jwt.verify(
        token, 
        process.env.EMAIL_VERIFICATION_SECRET || 'default_email_secret'
      ) as any;

      if (decoded.type !== 'email_verification') {
        return res.status(400).json({ message: 'Invalid token type' });
      }

      // Find and update user
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ message: 'Email already verified' });
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      res.json({ message: 'Email verified successfully' });
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({ message: 'Verification token has expired' });
      }
      res.status(400).json({ message: 'Invalid verification token' });
    }
  }

  // Resend verification email
  async resendVerification(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ message: 'Email already verified' });
      }

      const emailSent = await emailService.sendVerificationEmail(
        user.email, 
        user.name, 
        user._id.toString()
      );

      res.json({ 
        message: 'Verification email sent', 
        emailSent 
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to resend verification email', error: error.message });
    }
  }

  // Request password reset
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.authProvider !== 'local') {
        return res.status(400).json({ 
          message: `Password reset not available for ${user.authProvider} accounts` 
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // Send reset email
      const emailSent = await emailService.sendPasswordResetEmail(
        user.email, 
        user.name, 
        resetToken
      );

      res.json({ 
        message: 'Password reset email sent', 
        emailSent 
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to send password reset email', error: error.message });
    }
  }

  // Reset password
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
      }

      // Hash the token to compare with stored hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Update password
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch (error: any) {
      res.status(500).json({ message: 'Password reset failed', error: error.message });
    }
  }

  // Change password (for authenticated users)
  async changePassword(req: AuthRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.authProvider !== 'local') {
        return res.status(400).json({ 
          message: `Password change not available for ${user.authProvider} accounts` 
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      res.status(500).json({ message: 'Password change failed', error: error.message });
    }
  }

  // Get current user profile
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
  }

  // Google OAuth callback (placeholder - requires passport setup)
  async googleCallback(req: Request, res: Response) {
    try {
      // This would be handled by passport middleware
      // The user should be available in req.user after passport authentication
      const user = req.user as IUser;

      if (!user) {
        return res.status(401).json({ message: 'Google authentication failed' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error: any) {
      res.status(500).json({ message: 'Google authentication failed', error: error.message });
    }
  }

  // Logout (client-side token removal, but can be used for logging)
  async logout(req: AuthRequest, res: Response) {
    try {
      // In a stateless JWT system, logout is typically handled client-side
      // This endpoint can be used for logging purposes or token blacklisting
      res.json({ message: 'Logout successful' });
    } catch (error: any) {
      res.status(500).json({ message: 'Logout failed', error: error.message });
    }
  }

  // Refresh token
  async refreshToken(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate new JWT token
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.json({ 
        message: 'Token refreshed successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          avatar: user.avatar
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Token refresh failed', error: error.message });
    }
  }
}

export default new AuthController();