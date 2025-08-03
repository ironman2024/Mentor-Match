import express from 'express';
import auth from '../middleware/auth';
import Message from '../models/Message';
import User from '../models/User';
import Notification from '../models/Notification';

const router = express.Router();

// Get conversations list
router.get('/conversations', auth, async (req: any, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$recipient', req.user._id] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      { $unwind: '$otherUser' }
    ]);

    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages between two users
router.get('/:userId', auth, async (req: any, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name avatar');

    // Mark messages as read
    await Message.updateMany(
      {
        recipient: req.user._id,
        sender: req.params.userId,
        read: false
      },
      { read: true }
    );

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a message
router.delete('/:messageId', auth, async (req: any, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Only allow sender to delete their own message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    
    await Message.findByIdAndDelete(messageId);
    res.json({ message: 'Message deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post('/', auth, async (req: any, res) => {
  try {
    console.log('Sending message:', req.body);
    console.log('User:', req.user);
    
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient ID and content are required' });
    }

    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content,
      read: false
    });

    await message.save();
    await message.populate('sender', 'name avatar');

    console.log('Message saved:', message);

    // Update recipient's message count
    await User.findByIdAndUpdate(recipientId, {
      $inc: { messageCount: 1 }
    });

    // Socket.IO notification handled in index.ts
    res.status(201).json(message);
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
