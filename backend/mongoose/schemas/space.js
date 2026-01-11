
import mongoose from 'mongoose';

const SpaceScheme = new mongoose.Schema({
  name: {
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: false,
  },
  description: {
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: false,
  },
  price: { // per month
    type: mongoose.SchemaTypes.Number,
    required: true,
    default: 1
  },
  size: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  images: {
    type: mongoose.SchemaTypes.Array,
    required: process.env.NODE_ENV === 'production' ? true : false
  },
  provider: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Provider',
    required: true,
  },
  _addedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  publish: {
    type: mongoose.SchemaTypes.Boolean,
    default: true,
  },
  rentBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: false
  },
}, {
  timestamps: true,
})

export const Space = mongoose.model('Space', SpaceScheme)
