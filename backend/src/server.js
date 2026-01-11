// app
import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
// utils
import cors from 'cors';
import 'dotenv/config'
import * as Mid from '../routes/middleware.js'
import { initiateAdmin } from '../utils/utils.js';
const PORT = process.env.PORT || 3000;
// route
import auth from '../routes/auth.js'
import admin from '../routes/ro-admin.js'
import my from '../routes/ro-user.js'
import provider from '../routes/ro-provider.js'
import catalogue from '../routes/ro-catalogue.js'
import space from '../routes/ro-space.js'
import rent from '../routes/ro-rent.js'
import { Space } from '../mongoose/schemas/space.js';
import { s3Con } from '../utils/s3.js';

const app = express()
const server = http.createServer(app)
app.use(cors())
app.use(express.json())

app.use(Mid.logRequest)
app.use('/v1/catalogue', catalogue)
app.use('/v1/auth', auth)
app.use('/v1', Mid.checkToken)
app.use('/v1/admin', admin)
app.use('/v1/my', my)
app.use('/v1/provider', provider)
app.use('/v1/space', space)
app.use('/v1/rent', rent)

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    initiateAdmin()
  })
  .catch(err => {
    console.log(err)
  })
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
