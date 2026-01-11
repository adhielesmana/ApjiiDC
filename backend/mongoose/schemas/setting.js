import mongoose from 'mongoose'

const SettingSchema = new mongoose.Schema({
  ppn: {
    type: Number,
    default: 11
  },
  maintenance_mode: {
    type: Boolean,
    default: false
  },
  allow_manual_entry: {
    type: Boolean,
    default: true
  },
  allow_override: {
    type: Boolean,
    default: false
  },
  allow_skip: {
    type: Boolean,
    default: false
  },
  allow_reopen: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

export const Setting = mongoose.model('Setting', SettingSchema)
