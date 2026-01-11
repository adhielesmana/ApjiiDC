import { Router } from 'express'
import { body, matchedData, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import { Space } from '../mongoose/schemas/space.js'
import { Rent } from '../mongoose/schemas/rent.js'
import { User } from '../mongoose/schemas/user.js'
import { isAdmin, isProvider, isUser } from './middleware.js'
import { handleFile, plog, resor, ret500, validateRequest } from '../utils/utils.js'
import { Invoice } from '../mongoose/schemas/invoice.js'
import multer from 'multer'
import { s3Con } from '../utils/s3.js'


const router = Router()

router.get('/baa', async (req, res) => {
  try {
    const id = req.query.id
    if (!id) resor(res, 404, 'Invalid rent ID')

    const rent = await Rent.findOne({ _id: id })
    const url = await s3Con.getTemporaryUrl(rent.baa)
    return res.status(200).json({
      status: 'ok',
      data: url
    })
  } catch (err) {
    return ret500(req, res, err)
  }


})

router.post('/filter', async (req, res) => {
  const { status, paidAttempt } = req.body
  const { page, limit } = req.query

})
// Global
//
router.get('/list/unpaid', async (req, res) => {
  try {
    let lists
    if (req.admin) {
      // need background worker to check periodically for invoice that is "in the past

    }
  } catch (err) {
    return ret500(req, res, err)
  }
})

router.get('/list/pending', async (req, res) => {
  try {
    let lists
    if (req.admin) {
      lists = await Rent.find({
        paidAttempt: true
      }).populate(['space', 'provider', 'by']).exec()
    } else if (req.user) {
      lists = await Rent.find({
        by: req.user._id,
        paidAttempt: true
      }).populate(['space', 'provider', 'by']).exec()
    } else if (req.user.provider) {
      lists = await Rent.find({
        provider: req.user.provider._id,
        paidAttempt: true
      }).populate(['space', 'provider', 'by']).exec()
    }

    return res.status(200).json({
      status: 'ok',
      data: lists
    })

  } catch (err) {
    return ret500(req, res, err)
  }
})
router.get('/list', async (req, res) => {

  try {
    let list
    if (req.admin) {
      list = await Rent.find({}).populate(['space', 'provider'])
        .populate({
          path: 'by',
          select: '-password'
        }).exec()

    } else if (req.user.provider) {
      // handle provider
      // list available provider
      list = await Rent.find({
        provider: req.user.provider._id,
      }).populate([{
        path: 'by',
        select: '-password'
      }, 'space']).exec()

    } else {
      // handle user
      list = await Rent.find({
        by: req.user.id
      }).populate(['provider', 'space', 'invoice']).exec()
    }
    return res.status(200).json({
      status: 'ok',
      data: list
    })
  } catch (error) {
    return ret500(req, res, error)
  }
})
router.post('/verify', isAdmin, [
  body('rentId').isString().notEmpty().withMessage('Invalid Rent ID'),
  body('invoiceId').isString().notEmpty().withMessage('Invalid Invoice ID'),
  body('action').isBoolean().withMessage('Message must not be empty')
], validateRequest, async (req, res) => {
  try {
    const { rentId, invoiceId, action } = req.body
    const rent = await Rent.findOne({
      _id: rentId,
      status: 'active'
    }).populate('invoice').exec()
    if (!rent) resor(res, 'Rent is not found')

    const invoiceIndex = rent.invoice.history.findIndex(iv => iv.invoiceId === invoiceId)
    if ([-1, 0].includes(invoiceIndex)) resor(res, 'Such invoice is not found under this rent')

    if (rent.invoice.history[invoiceIndex].status === 'paid') resor(res, 401, 'Error : Invoice has been paid and verified')

    rent.invoice.history[invoiceIndex] = {
      ...rent.invoice.history[invoiceIndex],
      verifiedBy: req.user.id,
      status: action ? 'paid' : 'rejected'
    }
    await rent.invoice.save()

    return res.status(201).json({
      status: 'ok',
      message: `Invoice has been ${action ? 'verified' : 'rejected'}`
    })
  } catch (err) {
    return ret500(req, res, err)
  }
})
// Is User
router.post('/pay', isUser, [
  handleFile.single('proof'),
  body('rentId').isString().notEmpty().withMessage('Invalid Rent ID'),
  body('invoiceId').isString().notEmpty().withMessage('Invalid Invoice ID')
], validateRequest, async (req, res) => {
  const { rentId, invoiceId } = req.body
  try {
    const rent = await Rent.findOne({
      _id: rentId,
      by: req.user.id
    }).populate('invoice').exec()
    if (!rent) resor(res, 404, 'Rent with such id does not exist')
    const invoiceIndex = rent.invoice.history.findIndex(iv => {
      //  the condition is
      // 1. matching ID
      // 2. not verified, this second condition enable user to "edit" payment proof without separate endpoint,
      // it'll just update the invoice proof of Paid and its timestamp
      return (iv.invoiceId === invoiceId) && iv.status != 'verified'
    })
    if (invoiceIndex === -1) resor(res, 404, 'Unpaid invoice with such id does not exist')
    const invoiceReleaseData = new Date(rent.invoice.history[invoiceIndex].releaseDate)
    if (invoiceReleaseData > new Date()) resor(res, 400, 'Invoice release date has not yet arrived')
    if (rent.invoice.history[invoiceIndex].verifiedBy) resor(res, 401, 'This invoice has already been paid')

    //

    const key = await s3Con.uploadFile({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      provider: rent.provider,
      filename: `proof-${rentId}`,
      path: 'proof'
    })

    rent.invoice.history[invoiceIndex] = {
      ...rent.invoice.history[invoiceIndex].toObject(),
      paidAt: new Date(),
      proofOfPaid: key,
      status: 'pending'
    }
    rent.status = 'pending'
    rent.paidAttempt = true
    await rent.save()
    await rent.invoice.save()

    return res.status(201).json({
      status: 'ok',
      message: 'Proof been uploaded sucessfully'
    })
  } catch (error) {
    return ret500(req, res, error)
  }
})

router.post('/activate', isProvider, [
  handleFile.single('baa'),
  body('rentId').isString().notEmpty().withMessage('Invalid Rent ID'),
], validateRequest, async (req, res) => {
  try {
    const { rentId } = req.body
    console.log('user provider', req.user)
    const rent = await Rent.findOne({
      _id: rentId,
      status: 'provisioned',
      provider: req.user.provider._id
    }).populate('invoice').exec()

    if (!rent) resor(res, 404, 'No such rent exist')

    const baaKey = await s3Con.uploadFile({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      provider: req.user.provider._id,
      filename: `baa-${rentId}`,
      path: 'rent'
    })
    const history = [];
    const currentDate = new Date();

    for (let i = 1; i <= 11; i++) {
      // Calculate month and year, accounting for year rollovers
      const targetMonth = currentDate.getMonth() + i;
      const targetYear = currentDate.getFullYear() + Math.floor(targetMonth / 12);
      const normalizedMonth = targetMonth % 12; // Ensures month is 0-11

      // Last day of the target month
      const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
      // Use current day or last day of month, whichever is smaller
      const day = Math.min(currentDate.getDate(), lastDay);

      const releaseDate = new Date(targetYear, normalizedMonth, day);

      // Format invoice ID
      console.log('releaseDate', releaseDate)
      const formattedMonth = String(normalizedMonth + 1).padStart(2, '0');
      const formattedYear = String(targetYear);
      const invoiceId = `rnt-${formattedYear}${formattedMonth}-${releaseDate.getTime()}`;

      history.push({
        releaseDate: releaseDate,
        invoiceId: invoiceId
      });
    }
    rent.invoice.history = [
      ...rent.invoice.history,
      ...history
    ]
    rent.handledBy.push(req.user.id)
    rent.baa = baaKey
    console.log('history releaseDate', history[0].releaseDate)
    rent.ttl = history[0].releaseDate
    rent.status = 'active'
    await rent.invoice.save()
    await rent.save()
    return res.status(200).json({
      status: 'ok',
      message: 'Rent has been sucessfully activated'
    })
  } catch (error) {
    return ret500(req, res, error)
  }

})

router.post('/provision', isAdmin, [ // provisioned by apjii
  body('rentId').isString().notEmpty().withMessage('Invalid Rent ID')
], validateRequest, async (req, res) => {
  try {
    const { rentId } = req.body
    const rent = await Rent.findOne({
      _id: rentId,
      status: 'pending',
      paidAttempt: true
    }).populate('invoice').exec()

    if (!rent) resor(res, 404, 'No such rent exist')

    if (!rent.invoice.history[0].proofOfPaid) resor(res, 401, 'Invoice payment proof is empty')

    rent.invoice.history[0] = {
      ...rent.invoice.history[0].toObject(),
      verifiedBy: req.admin.id,
      status: 'verified'
    }
    rent.status = 'provisioned'
    rent.paidAttempt = false
    rent.handledBy.push(req.admin.id)
    await rent.invoice.save()
    await rent.save()
    return res.status(200).json({
      status: 'ok',
      message: 'Rent has been sucessfully provisioned'
    })
  } catch (error) {
    return ret500(req, res, error)
  }
})

router.post('/new', isUser, [
  body('spaceId').isString().withMessage('Invalid spaceId'),
], validateRequest, async (req, res) => {
  try {
    const { spaceId } = req.body
    const space = await Space.findOne({
      _id: spaceId,
      rentBy: { $exists: false }
    }).populate('provider').exec()

    if (!space) resor(res, 404, 'No such space exist')
    if (!space?.publish) resor(res, 400, 'This space is not for rent')
    const rent = await Rent.create({
      by: req.user.id,
      space: space._id,
      provider: space.provider._id,
      price: space.price,
      handledBy: [req.user.id]
    })
    const invoice = await Invoice.create({
      space: space._id,
      provider: space.provider._id,
      user: req.user.id,
      history: [{
        releaseDate: new Date(),
        invoiceId: `req-${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getTime()}`
      }]
    })
    rent.invoice = invoice._id
    space.rentBy = req.user.id
    await space.save()
    await rent.save()

    return res.status(200).json({
      status: 'ok', data: {
        rent, invoice: {
          space: space.name,
          provider: space.provider.name,
          detail: invoice.history[0],
          nominal: space.price
        }
      }
    })
  } catch (error) {
    return ret500(req, res, error)
  }
})

export default router
