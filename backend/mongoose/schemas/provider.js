import mongoose from 'mongoose';

const ProviderScheme = new mongoose.Schema({
  name: {
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: true,
  },
  contact: {
    email: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    phone: {
      type: mongoose.SchemaTypes.String,
      required: true,
    }
  },
  description: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  province: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  city: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  pos: {
    type: mongoose.SchemaTypes.Number,
    required: true,
  },
  address: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  members: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
  }],
  status: {
    type: mongoose.SchemaTypes.String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  }
})

export const Provider = mongoose.model('Provider', ProviderScheme)
