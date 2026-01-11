import { Router } from 'express'
import util from 'util'
import { User } from '../mongoose/schemas/user.js'
import { body, matchedData, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import { isAdmin, isProvider } from './middleware.js'
import { resor, validateRequest } from '../utils/utils.js'
import { Space } from '../mongoose/schemas/space.js'
import multer from 'multer'
import { s3Con } from '../utils/s3.js'
import { Provider } from '../mongoose/schemas/provider.js'
import { Setting } from '../mongoose/schemas/setting.js'
import { Datacenter } from '../mongoose/schemas/datacenter.js'

const router = Router()

router.get('/settings', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({
        ppn: 11,
        maintenance_mode: false,
        allow_manual_entry: true,
        allow_override: false,
        allow_skip: false,
        allow_reopen: false
      });
    }
    return res.status(200).json({
      status: 'ok',
      data: settings
    });
  } catch (error) {
    console.log('err@settings', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error: error.message
    });
  }
})


router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const catalogue = await Space.find({
      publish: true,
      rentBy: { $exists: false },
      name: search ? { $regex: search, $options: 'i' } : { $exists: true }
    }).populate(['provider'])
      .select('-__v -createdAt -updatedAt -publish')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const processedCatalogue = await Promise.all(catalogue.map(async space => {
      // Process all images in a single space in parallel
      const imagesUrl = await Promise.all(
        space.images.map(image => s3Con.getTemporaryUrl(image))
      );

      // Return a new object with the imagesUrl added
      return {
        ...space,
        images: imagesUrl
      };
    }));
    return res.status(200).json({
      status: 'ok',
      data: processedCatalogue
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error: error.message
    })
  }
})
router.get('/space/:id', async (req, res) => {
  try {
    const space = await Space.findById(req.params.id).populate(['provider']);
    if (!space) return res.status(404).json({ status: 'error', message: 'Space not found' });

    const imagesUrl = await Promise.all(
      space.images.map(image => s3Con.getTemporaryUrl(image))
    );
    return res.status(200).json({
      status: 'ok',
      message: 'Space fetched successfully',
      data: {
        ...space.toObject(),
        images: imagesUrl
      },
    });
  } catch (error) {
    console.log('err@space/:id', error)
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    })
  }
})
router.get('/provider', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const providers = await Provider.find()
      .select('-members')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      status: 'ok',
      data: providers
    });
  } catch (error) {
    console.log('err@provider/:id', error)
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    })
  }
})
router.get('/provider/:id', async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).lean()
    if (!provider) resor(res, 404, 'Provider not found')
    return res.status(200).json({
      status: 'ok',
      data: provider
    });
  } catch (error) {
    console.log('err@provider/:id', error)
    resor(res, 500, 'Internal Server Error')
  }
})
router.get('/provider/:id/spaces', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  try {
    const spaces = await Space.find({
      provider: req.params.id,
      publish: true,
      rentBy: { $exists: false }
    }).limit(limit).skip((page - 1) * limit).lean().exec()

    const processedSpaces = await Promise.all(spaces.map(async space => {
      const imagesUrl = await Promise.all(
        space.images.map(image => s3Con.getTemporaryUrl(image))
      );
      return {
        ...space,
        images: imagesUrl
      };
    }));
    if (!spaces) resor(res, 404, 'Provider not found')
    return res.status(200).json({
      status: 'ok',
      data: processedSpaces
    });
  } catch (error) {
    console.log('err@provider/:id', error)
    resor(res, 500, 'Internal Server Error')
  }
})

router.get('/datacenter', async (req, res) => {
  try {
    const datacenters = await Datacenter.find({ status: 'active' }).lean();
    return res.status(200).json({
      status: 'ok',
      data: datacenters
    });
  } catch (error) {
    console.log('err@datacenter', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error: error.message
    });
  }
})

router.get('/datacenter/:id', async (req, res) => {
  try {
    const datacenter = await Datacenter.findById(req.params.id).lean();
    if (!datacenter) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Datacenter not found' 
      });
    }
    return res.status(200).json({
      status: 'ok',
      data: datacenter
    });
  } catch (error) {
    console.log('err@datacenter/:id', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error: error.message
    });
  }
})

export default router
