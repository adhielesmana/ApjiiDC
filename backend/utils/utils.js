import { User } from '../mongoose/schemas/user.js';
import jwt from 'jsonwebtoken'
import readline from 'readline';
import bcrypt from 'bcrypt'
import { validationResult } from 'express-validator';
import multer from 'multer';

export const plog = (message) => {
  console.log('[LOG]', JSON.stringify(message))
}

export const ret500 = (req, res, err) => {
  console.log('Internal Error \n', err)
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      status: 'error',
      message: 'internal error'
    })
  }
  return res.status(500).json({
    status: 'error',
    message: 'internal error',
    error: err?.message,
    user: req.user
  })
}


export const resor = (res, code, message) => {
  return res.status(code).json({
    status: 'error',
    message: message || 'Interal server error'
  })
}

export const handleFile = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    // Optional: Add file type validation
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) {
      console.log("ERROR", "Invalid file type", file.mimetype);
      return cb(new Error("Invalid file type"), false);
    } else {
      console.log("INFO", "Valid file type", file.mimetype);
    }
    cb(null, true);
  }
})

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() })
  } else {
    next()
  }
}

const askQuestion = async (rl, query) => {
  return new Promise((resolve) => {
    rl.question(query, answer => {
      resolve(answer)
    })
  })
}

export const initiateAdmin = async () => {
  console.log('[LOG] Admin checks...')
  try {
    const uAdmin = await User.findOne({ username: 'admin' })
    if (uAdmin) {
      console.log('[LOG] Admin already exists')
      return
    } else {
      console.log('[LOG] Creating admin...')
      const rawPassword = process.env.ADMIN_PASS
      bcrypt.hash(rawPassword, 10, async function (err, hash) {
        if (err) {
          console.log(err)
          return
        }
        await User.create({
          username: process.env.ADMIN_USERNAME,
          email: process.env.ADMIN_EMAIL,
          password: hash,
          roleType: 'admin'
        })
        console.log('[LOG] Admin created')
      })
    }

  } catch (error) {
    throw error
  }
}

export const verifyRefreshToken = async (refToken) => {
  console.log('[TOKEN-EXPIRED] START-REFRESHING')
  console.log(refToken)
  let isRefresh
  try {
    const refTokenDecoded = jwt.verify(refToken, process.env.JWT_SECRET)
    const user = await User.findOne({
      activeRefreshToken: refToken
    })
    console.log('user : ', user?.username)
    isRefresh = {
      result: false
    }
    if (user) {
      isRefresh.result = true
      isRefresh.username = user.username
      isRefresh.id = user._id
    }
  } catch (error) {
    console.log(error)
  }
  return isRefresh
}
