import mongoose from 'mongoose';

const DatacenterSchema = new mongoose.Schema({
  name: {
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: true,
  },
  description: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  address: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  coordinate: {
    type: mongoose.SchemaTypes.String,
    required: false,
  },
  city: {
    type: mongoose.SchemaTypes.String,
    required: false,
  },
  province: {
    type: mongoose.SchemaTypes.String,
    required: false,
  },
  status: {
    type: mongoose.SchemaTypes.String,
    enum: ['active', 'inactive'],
    default: 'active',
  }
}, {
  timestamps: true,
})

export const Datacenter = mongoose.model('Datacenter', DatacenterSchema)
