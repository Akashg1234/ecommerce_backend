const express = require('express')
const { getAllProducts,createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getAllReviewsOfAProduct, deleteProductReview } = require('../Controllers/productControllers')
const {isAuthenticated, authorizedRoles} = require('../Middleware/authentication')
const router = express.Router()

// product routing
router.route('/products').get(getAllProducts)
router.route('/product/:id').get(getProductDetails)

router.route('/admin/product/new').post(isAuthenticated,authorizedRoles('admin'),createProduct)
router.route('/admin/product/:id').put(isAuthenticated,authorizedRoles('admin'),updateProduct)
router.route('/admin/product/:id').delete(isAuthenticated,authorizedRoles('admin'),deleteProduct)

router.route('/review').put(isAuthenticated,createProductReview)
router.route('/all-reviews').get(getAllReviewsOfAProduct).delete(isAuthenticated,deleteProductReview)


module.exports=router