import { Router } from 'express'
import { User } from '../mongoose/schemas/user.js'
import { matchedData, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import { Provider } from '../mongoose/schemas/provider.js'
import { Space } from '../mongoose/schemas/space.js'
import { Rent } from '../mongoose/schemas/rent.js'

const router = Router()
router.get('/my', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('provider').exec()
    return res.status(200).json({ status: 'success', data: user })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' })
  }
})

router.get('/dashboard', async (req, res) => {
  if (req.admin) {
    const providers = await Provider.countDocuments()
    const spacesActive = await Space.countDocuments({
      rentBy: { $exists: true }
    })
    const spacesAll = await Space.countDocuments()

    return res.status(200).json({
      status: 'ok',
      data: { providers, spacesActive, spacesAll }
    })
  } else if (req.user.provider) {
    const provider = await Provider.findOne({
      _id: req.user.provider._id
    }).populate({
      path: 'members',
      select: '-password -__v'
    }).exec()

    const rents = await Rent.find({
      provider: provider._id,
    }).populate('space').exec()

    const spaceCount = await Space.countDocuments({ provider: provider._id })

    return res.status(200).json({ status: 'ok', data: { provider, rents: rents, spaceCount } })
  } else {
    const user = await User.findById(req.user.id)
    const spaces = await Space.find({
      rentBy: user._id
    })
    return res.status(200).json({ status: 'ok', data: { user, spaces } })
  }
})

export default router
