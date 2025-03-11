const express = require('express');
const router = express.Router();


const uploadMiddleware = require('../utils/handleStorage');
const {updateImage, getItems} = require('../controllers/storage');

router.get('/', getItems)

//router.post('/', uploadMiddleware.single('image'), updateImage);

//router.post('/', uploadMiddleWareMemory.single('image'), updateImage);

module.exports = router;