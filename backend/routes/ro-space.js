import { Router } from 'express'
import util from 'util'
import { User } from '../mongoose/schemas/user.js'
import { body, matchedData, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import { isAdmin, isProvider } from './middleware.js'
import { resor, validateRequest } from '../utils/utils.js'
import { Space } from '../mongoose/schemas/space.js'
import multer from 'multer'
import { s3Con } from '../utils/s3.js'

const router = Router()
const handleUpload = multer({
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

router.get('/view/:space', async (req, res) => {
  const space = await Space.findById(req.params.space).populate(['rentBy'])
  if (!space) return res.status(404).json({ status: 'error', message: 'Space not found' })
  return res.status(200).json({
    status: 'ok',
    data: space
  })
})

router.get('/list', async (req, res) => {
  let spaces
  if (req.user.provider) {
    console.log('here')
    spaces = await Space.find({
      provider: req.user.provider._id
    }).populate({
      path: 'rentBy',
      select: '-password -__v'
    }).lean().exec()
  } else {
    spaces = await Space.find({
      rentBy: req.user.id
    }).lean()
  }
  spaces = await Promise.all(spaces.map(async space => {
    const imagesUrl = await Promise.all(
      space.images.map(image => s3Con.getTemporaryUrl(image))
    )
    return {
      ...space,
      images: imagesUrl
    }
  }))
  return res.status(200).json({
    status: 'ok',
    data: spaces
  })
})

router.post('/new', isProvider, [
  handleUpload.array('images', 5),
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('description').isString().withMessage('Invalid description'),
  body('price').isNumeric().withMessage('Invalid price'),
  body('size').isNumeric().notEmpty().withMessage('Size is required')
], validateRequest, async (req, res) => {
  try {
    const { body } = req
    if (req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Images are required'
      })
    }
    const user = await User.findById(req.user.id).populate('provider').lean()
    const space = await Space.create({
      ...body,
      provider: user.provider._id,
      _addedBy: user._id
    })
    res.status(200).json({
      status: 'ok',
      message: 'Space created successfully',
      data: space
    })
    try {
      const uploaded = []
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const key = await s3Con.uploadFile({
            buffer: file.buffer,
            mimeType: file.mimetype,
            provider: user.provider._id,
            filename: space.name,
            path: 'space'
          })
          uploaded.push(key)
        }
        await Space.findByIdAndUpdate(space._id, { images: uploaded })
      }
    } catch (error) {
      await Space.findByIdAndUpdate(space._id, {
        images: ['Error uploading image', util.inspect(error)]
      })
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
      debug: process.env.NODE_ENV === 'dev' ? util.inspect(error) : ''
    })
  }
})

// switch catalogue
router.post('/publish', isProvider, [
  body('spaceId').isString().notEmpty().withMessage('Space ID is required'),
], validateRequest, async (req, res) => {
  try {
    const { spaceId } = req.body
    const user = await User.findById(req.user.id).populate('provider').lean()
    const space = await Space.findOne({ _id: spaceId, provider: req.user.provider._id })
    if (!space) return res.status(404).json({
      status: 'error',
      message: 'Space not found'
    })
    space.publish = space.publish ? false : true
    await space.save()
    return res.status(200).json({
      status: 'ok',
      message: 'Space status updated successfully',
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
      debug: process.env.NODE_ENV === 'dev' ? util.inspect(error) : ''
    })
  }
})

export default router
