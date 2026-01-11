import { Router } from 'express'
import { User } from '../mongoose/schemas/user.js'
import { body, matchedData, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import { isAdmin } from './middleware.js'
import { resor, validateRequest } from '../utils/utils.js'
import { Provider } from '../mongoose/schemas/provider.js'


const router = Router()

// Provider account cannot create another provider
//
router.post('/grant', isAdmin,
  [body('id').isString().withMessage('id must be a string')],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.body
      const provider = await Provider.findOne({
        _id: id,
        status: 'inactive',
      }).populate('members').exec()
      if (!provider) resor(res, 404, 'Provider not found')
      provider.status = 'active'
      console.log('provider : ', provider)
      provider.members.map(async member => {
        member.roleType = 'provider'
        await member.save()
      })

      await provider.save()
      return res.status(200).json({
        status: 'ok',
        message: 'Provider is active'
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      })
    }
  })

router.post('/new', [
  body('name').isLength({ min: 3, max: 16 }).withMessage('name must be at least 3 characters long'),
  body('description').isLength({ min: 6 }).withMessage('description must be at least 6 characters long'),
  body('contact.email').isEmail().withMessage('email must be a valid email address'),
  body('contact.phone').isMobilePhone().withMessage('phone must be a valid phone number'),
  body('address').isLength({ min: 5 }).withMessage('address must be at least 5 characters long'),
  body('city').notEmpty().withMessage('City must not empty'),
  body('province').notEmpty().withMessage('Province must not empty'),
  body('pos').notEmpty().withMessage('Pos must not empty'),
], validateRequest, async (req, res) => {
  try {
    const { body } = req
    const user = await User.findById(req.user.id).select('_id roleType').exec()
    if (user.roleType === 'provider') {
      return res.status(401).json({
        status: 'error',
        message: 'You are already registered as a provider'
      })
    }
    const p = await Provider.create({
      ...body,
      members: [user._id]
    })
    user.provider = p._id
    await user.save()

    return res.status(200).json({ status: 'ok', message: 'Provider group created successfully' })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: error.message
    })
  }
})


export default router
