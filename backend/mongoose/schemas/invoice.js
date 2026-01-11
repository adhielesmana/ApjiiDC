import mongoose from 'mongoose';

const InvoiceScheme = new mongoose.Schema({
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
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  history: [{
    invoiceId: { // new and activate
      type: mongoose.SchemaTypes.String,
      required: true
    },
    releaseDate: { // new and activate
      type: mongoose.SchemaTypes.Date,
      required: true
    },
    paidAt: { // pay
      type: mongoose.SchemaTypes.Date,
    },
    verifiedBy: { // provision
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    proofOfPaid: { // pay
      // contain string as key to s3 item
      type: mongoose.SchemaTypes.String,
    },
    status: { // provision
      type: mongoose.SchemaTypes.String,
      enum: ['rejected', 'verified', 'unpaid', 'pending'],
      default: 'unpaid'
    }
  }],
}, { timestamps: true })

export const Invoice = mongoose.model('Invoice', InvoiceScheme)
