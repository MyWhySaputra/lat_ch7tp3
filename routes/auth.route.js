const express = require('express')
const router = express.Router()
const { Create, verifyEmail, Login, updateProfile } = require('../controller/auth.controller')
const { Auth } = require('../middleware/middleware')

const multer = require("multer")()

router.post('/auth/create', multer.single("image"), Create)

router.get('/auth/verify-email', verifyEmail)

router.post('/auth/login', Login)

router.put('/auth/update-profile', Auth, multer.single("image"), updateProfile)

module.exports = router