import mongoose from 'mongoose';

const RoleScheme = new mongoose.Schema({
  name: {
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: true,
  },
  description: {
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: false,
  },
})

export const Role = mongoose.model('Role', RoleScheme)
