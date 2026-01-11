import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../mongoose/schemas/user.js';
import bcrypt from 'bcrypt'
import { validateRequest } from '../utils/utils.js';

const router = express.Router();
dotenv.config();

router.post('/register', [
  body('username').isLength({ min: 3, max: 15 }).withMessage('Username must be between 3 - 15 characters long'),
  body('fullName').isLength({ min: 3, max: 20 }).withMessage('fullName must be between 3 - 20  characters long'),
  body('phone').isLength({ min: 3, max: 16 }).withMessage('Phone number must be at least 3 characters long'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], validateRequest, async (req, res) => {
  try {
    const { body } = req
    const { username, fullName, phone, email, password } = body
    const user = await User.findOne({
      $or: [
        { email: email },
        { phone: phone }
      ]
    })
    if (user) {
      return res.status(400).json({ status: 'error', message: 'User with associated email or phone already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ username, fullName, phone, email, password: hashedPassword })
    await newUser.save()
    return res.status(201).json({ status: 'ok', message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });
  }
})

router.post('/login', [
  body('usernameOrEmail').isLength({ min: 3, max: 16 }).withMessage('usernameOrEmail must be at least 3 characters long'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],
  validateRequest,
  async (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body;
      const user = await User.findOne({
        $or: [
          { email: usernameOrEmail },
          { username: usernameOrEmail }
        ]
      }).select('+password').populate('provider').lean()

      if (!user) {
        return res.status(401).json({ status: 'error', message: 'Invalid Credentials' });
      }
      const result = bcrypt.compareSync(password, user.password);
      if (!result) {
        return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      }
      if (user?.provider?.status !== 'active') {
        delete user.provider
      }
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.roleType, provider: user.provider },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );

      const refreshToken = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      )
      delete user.password
      delete user._id
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/',
      })
      res.json({
        token: `Bearer ${token}`,
        user,
      });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
    }
  });

router.post('/callbackOauthApjii', async (req, res) => {
  try {
    console.log("ASdasdasd");
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ status: 'error', message: 'Code is required' });
    }

    const response = await fetch(`${process.env.OAUTH_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Basic NDE4NGZlOTQtYWUyZS00YzI2LWE2NjctZmRjZjVlMGM1ZjU4OnY1ckkvYy95Y1Erb1RHcFJWMitEM0VYR3ppQ2NFWU9jWTJ3a1J5eWlRMG5hRS9nbDEvMmhvcis0aU5ZbkVHT3hlQkZxc3ppMFkyRlNIcmN1NytIcGdBPT0==`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
      }),
    });

    if (!response.ok) {
      return res.status(response.status).json({ status: 'error', message: 'Failed to exchange code for token' });
    }

    const data = await response.json();
    const userResponse = await fetch(`${process.env.OAUTH_URL}/api/v1/profile`, {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return res.status(userResponse.status).json({ status: 'error', message: 'Failed to fetch user data' });
    }

    const userData = await userResponse.json();
    let user = await User.findOne({ email: userData.email }).populate('provider').lean();

    if (!user) {
      user = new User({
        username: userData.username,
        fullName: userData.fullName,
        phone: userData.phone,
        email: userData.email,
        company: userData.company,
        roleType: 'user',
        oauth_provider: 'apjii',
        oauth_id: userData.id,
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.roleType, provider: user.provider },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    const refreshToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    delete user.password;
    delete user._id;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
    });
    res.json({
      token: `Bearer ${token}`,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });

  }
});

export default router;
