const express = require('express')
const router = express.Router();
const { authenticateUser, authorizePermissions } = require('../middleware/authentication')

const { createProduct, getAllProduct, getSingleProduct, updateProduct, deleteProduct, uploadImage} = require('../controllers/productController')

const {getSingleProductReview} = require('../controllers/reviewController')

router.route('/').post([authenticateUser, authorizePermissions('admin')], createProduct)
.get(getAllProduct);

router.route('/uploadImage')
.post([authenticateUser, authorizePermissions('admin')], uploadImage)

router.route('/:id')
.get(getSingleProduct)
.patch([authenticateUser, authorizePermissions('admin')], updateProduct)
.delete([authenticateUser, authorizePermissions('admin')], deleteProduct)

router.route('/:id/reviews').get(getSingleProductReview)


module.exports = router;