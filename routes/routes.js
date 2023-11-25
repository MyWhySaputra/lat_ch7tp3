const express = require('express')
const authRoute = require('./auth.route')
const morgan = require('morgan')

// version 1 
const v1 = express.Router()
v1.use(morgan('dev'));
v1.use('/', [authRoute])

const router = express.Router()
router.use('/api/v1', v1)

// default version
router.use('/api', v1)

module.exports = router