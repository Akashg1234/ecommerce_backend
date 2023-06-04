const express = require('express')
const { newOrder, getSingleOrder, getMyOrders, getAllOrders, updateOrderStatus, deleteOrder } = require('../Controllers/oderController')
const {isAuthenticated, authorizedRoles} = require('../Middleware/authentication')
const router = express.Router()

router.route('/order/new').post(isAuthenticated,newOrder)

router.route('/order/:id').get(isAuthenticated,getSingleOrder)

router.route('/orders/me').get(isAuthenticated,getMyOrders)

router.route('/admin/orders').get(isAuthenticated,authorizedRoles("admin"),getAllOrders)

router.route('/admin/order/:id').put(isAuthenticated,authorizedRoles("admin"),updateOrderStatus).delete(isAuthenticated,authorizedRoles("admin"),deleteOrder)

module.exports=router