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

// Send a message
router.post('/', auth, async (req: any, res) => {
  try {
    const { recipientId, content } = req.body;

    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content,
      read: false
    });

    await message.save();
    await message.populate('sender', 'name avatar');

    // Update recipient's message count
    await User.findByIdAndUpdate(recipientId, {
      $inc: { messageCount: 1 }
    });

    // Socket.IO notification handled in index.ts
    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
