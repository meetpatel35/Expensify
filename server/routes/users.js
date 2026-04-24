import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const users = await User.find({}).select('name email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
