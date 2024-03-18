// eslint-disable-next-line no-unused-vars
const { PORT, MONGO_URL } = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')

const loginRouter = require('./controllers/login')
const usersRouter = require('./controllers/users')
const preregisterRouter = require('./controllers/preregister')
const checkoutRouter = require('./controllers/checkout')
const paypalRouter = require('./controllers/paypal')

const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
logger.info('Connecting to:', MONGO_URL)

mongoose.connect(MONGO_URL)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch(error => logger.error('error connecting to MongoDB:', error.message))

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)
app.use('/api/preregister', preregisterRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api/paypal', paypalRouter)


app.use(middleware.unknownEndPoint)
app.use(middleware.errorHandler)

module.exports = app