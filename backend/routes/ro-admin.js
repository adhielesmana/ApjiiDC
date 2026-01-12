import { Router } from 'express'
import { User } from '../mongoose/schemas/user.js'
import { Provider } from '../mongoose/schemas/provider.js'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import { isAdmin } from './middleware.js'

const router = Router()

const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() })
  }
  next()
}

router.post('/user/create', isAdmin, [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validateRequest, async (req, res) => {
  try {
    const { username, email, password, fullName, phone, roleType, company, role } = req.body

    const existingUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Username or email already exists'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName: fullName || '',
      phone: phone || '',
      roleType: roleType || 'user',
      company: company || '',
      role: role || ''
    })

    res.status(201).json({
      status: 'ok',
      message: 'User created successfully',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        roleType: user.roleType
      }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create user'
    })
  }
})

router.post('/provider/create', isAdmin, [
  body('name').isLength({ min: 3 }).withMessage('Provider name must be at least 3 characters'),
  body('description').isLength({ min: 6 }).withMessage('Description must be at least 6 characters'),
  body('email').isEmail().withMessage('Must be a valid email'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('address').isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
  body('city').notEmpty().withMessage('City is required'),
  body('province').notEmpty().withMessage('Province is required'),
  body('pos').notEmpty().withMessage('Postal code is required'),
], validateRequest, async (req, res) => {
  try {
    const { 
      name, description, email, phone, address, city, province, pos,
      adminUsername, adminEmail, adminPassword 
    } = req.body

    const existingProvider = await Provider.findOne({ name })
    if (existingProvider) {
      return res.status(400).json({
        status: 'error',
        message: 'Provider with this name already exists'
      })
    }

    const provider = await Provider.create({
      name,
      description,
      contact: {
        email,
        phone
      },
      address,
      city,
      province,
      pos: parseInt(pos),
      status: 'active',
      members: []
    })

    let providerAdmin = null
    if (adminUsername && adminEmail && adminPassword) {
      const existingAdmin = await User.findOne({ 
        $or: [{ username: adminUsername }, { email: adminEmail }] 
      })
      
      if (existingAdmin) {
        await Provider.findByIdAndDelete(provider._id)
        return res.status(400).json({
          status: 'error',
          message: 'Admin username or email already exists'
        })
      }

      const hashedPassword = await bcrypt.hash(adminPassword, 10)
      providerAdmin = await User.create({
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        roleType: 'provider',
        provider: provider._id,
        role: 'admin'
      })

      await Provider.findByIdAndUpdate(provider._id, {
        $push: { members: providerAdmin._id }
      })
    }

    res.status(201).json({
      status: 'ok',
      message: 'Provider created successfully',
      data: {
        provider: {
          _id: provider._id,
          name: provider.name,
          status: provider.status
        },
        admin: providerAdmin ? {
          _id: providerAdmin._id,
          username: providerAdmin.username,
          email: providerAdmin.email
        } : null
      }
    })
  } catch (error) {
    console.error('Error creating provider:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create provider'
    })
  }
})

router.get('/users', isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const search = req.query.search || ''
    const roleType = req.query.roleType || ''

    const query = {}
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ]
    }
    if (roleType) {
      query.roleType = roleType
    }

    const total = await User.countDocuments(query)
    const users = await User.find(query)
      .populate('provider', 'name status _isActive')
      .select('-password -activeRefreshToken')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      status: 'ok',
      data: users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    })
  }
})

router.put('/user/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { username, email, fullName, phone, roleType, company, role, password } = req.body

    const updateData = {
      username,
      email,
      fullName,
      phone,
      roleType,
      company,
      role
    }

    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true })
      .select('-password -activeRefreshToken')

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      })
    }

    res.json({
      status: 'ok',
      message: 'User updated successfully',
      data: user
    })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update user'
    })
  }
})

router.delete('/user/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      })
    }

    if (user.roleType === 'admin') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete admin users'
      })
    }

    await User.findByIdAndDelete(id)

    res.json({
      status: 'ok',
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user'
    })
  }
})

export default router
