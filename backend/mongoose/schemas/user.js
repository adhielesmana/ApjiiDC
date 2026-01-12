import mongoose from 'mongoose';

const UserScheme = new mongoose.Schema({
  username: {
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: true,
  },
  fullName: {
    type: mongoose.SchemaTypes.String,
    required: false,
  },
  phone: {
    type: mongoose.SchemaTypes.String,
    required: false,
    unique: false,
  },
  email: {
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: true,
  },
  password: {
    type: mongoose.SchemaTypes.String,
    required: false,
    select: false
  },
  _isDeleted: {
    type: mongoose.SchemaTypes.Boolean,
    required: true,
    default: false,
    select: false // Hide this field by default
  },
  _isActive: {
    type: mongoose.SchemaTypes.Boolean,
    required: true,
    default: true,
    select: false // Hide this field by default
  },
  company: {
    type: mongoose.SchemaTypes.String,
    required: false,
    select: false // Hide this field by default
  },
  roleType: {
    type: mongoose.SchemaTypes.String,
    required: true,
    enum: ['admin', 'user', 'provider'],
    default: 'user'
  },
  role: {
    type: mongoose.SchemaTypes.String,
    required: false,
    enum: ['admin', 'staff', ''],
    default: ''
  },
  provider: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Provider',
    required: function () {
      return this.roleType === 'provider';
    }
  },
  oauth_provider: {
    type: mongoose.SchemaTypes.String,
    required: false,
    select: false // For OAuth providers, we may not need to store the password
  },
  oauth_id: {
    type: mongoose.SchemaTypes.String,
    required: false,
    select: false
  }
  // username, fullName, phone, email, password, roleType, provider
  // role: {
  //   type: mongoose.SchemaTypes.ObjectId,
  //   ref: 'Role',
  // },
})

export const User = mongoose.model('User', UserScheme)
