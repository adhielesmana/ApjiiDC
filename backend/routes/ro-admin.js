import { Router } from 'express'
import { User } from '../mongoose/schemas/user.js'
import { matchedData, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import { isAdmin } from './middleware.js'


const router = Router()


router.post('/user/create', async (req, res) => {

})



export default router
