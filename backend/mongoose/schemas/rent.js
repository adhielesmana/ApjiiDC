import mongoose from 'mongoose';

const RentScheme = new mongoose.Schema({
  by: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  space: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Space',
    required: true,
  },
  provider: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Provider',
    required: true,
  },
  invoice: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Invoice',
  },
  paidAttempt: {
    type: mongoose.SchemaTypes.Boolean,
    default: false
  },
  price: {
    type: mongoose.SchemaTypes.Number,
    required: true,
  },
  status: {
    type: mongoose.SchemaTypes.String,
    enum: ['unpaid', 'pending', 'provisioned', 'active', 'suspend', 'dismantle'],
    default: 'unpaid',
  },
  // time-to-live. duration is 1 month, counted from function in /rent/activate
  ttl: {
    type: mongoose.SchemaTypes.Date,
    required: function () {
      return this.status === 'active'
    },
  },
  baa: {
    type: mongoose.SchemaTypes.String
  },
  handledBy: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
  }],
  start: {
    type: mongoose.SchemaTypes.ObjectId,
  }
}, { timestamps: true })

export const Rent = mongoose.model('Rent', RentScheme)
