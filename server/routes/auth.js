import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '90d' });
}

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Enter an email and a password of at least 6 characters.' });
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ error: "That email's already registered. Try logging in instead." });
  }
  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ email: email.toLowerCase(), passwordHash });
  res.json({ token: signToken(user._id), email: user.email });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Enter your email and password.' });
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.checkPassword(password))) {
    return res.status(401).json({ error: 'Email or password is wrong.' });
  }
  res.json({ token: signToken(user._id), email: user.email });
});

export default router;
