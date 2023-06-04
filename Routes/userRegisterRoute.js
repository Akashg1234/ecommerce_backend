const express = require('express')
const router= express.Router()
const {registerUser, loginUser,logoutUser, forgotPassword, resetPassword, getUserDetails, updatePassword, updateUserProfile, getAllUsers, getSingleUser, deleteUser, updateUserRole} = require('../Controllers/userControllers')
const { isAuthenticated,authorizedRoles } = require('../Middleware/authentication')

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)

router.route('/password/forgot').post(forgotPassword)

router.route('/password/reset/:token').put(resetPassword)

router.route('/me').get(isAuthenticated,getUserDetails)

router.route('/password/update').put(isAuthenticated,updatePassword)

router.route('/me/update').put(isAuthenticated,updateUserProfile)

router.route('/admin/users').get(isAuthenticated,authorizedRoles('admin'),getAllUsers)

router.route('/admin/user/:id').get(isAuthenticated,authorizedRoles('admin'),getSingleUser).delete(isAuthenticated,authorizedRoles('admin'),deleteUser).put(isAuthenticated,authorizedRoles('admin'),updateUserRole)

router.route('/logout').get(logoutUser)

module.exports = router