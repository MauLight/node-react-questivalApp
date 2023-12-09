const bcrypt = require('bcrypt')
const crypto = require('crypto')
const emailjs = require('@emailjs/nodejs')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Token = require('../models/token')
// eslint-disable-next-line no-unused-vars
const { _, __, ___, _____, ______, TEMPLATE_ID, PUBLIC_KEY, PRIVATE_KEY, SERVICE_ID } = require('../utils/config')

// const clientURL = 'http://localhost:5173/test'
const clientURL = 'https://screenwriters.quest/test'

usersRouter.get('/', async (_, response) => {
  const users = await User.find({})
  response.json(users)
})

usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id)
  if (user) {
    response.json(user)
  }
  else {
    response.status(404).end()
  }
})

usersRouter.post('/', async (request, response, next) => {
  const { firstname, lastname, email, birthdate, password } = request.body

  const savedUser = await User.find({ email })
  if (savedUser.length > 0) {
    console.log('Email is already taken.')
    return response.status(401).json({
      error: 'Email is already taken.'
    })
  }

  console.log('this is the request', request.body)
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    firstname,
    lastname,
    birthdate,
    email,
    passwordHash
  })

  if (firstname === undefined || lastname === undefined || birthdate === undefined || email === undefined || password === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  user.save().then(savedUser => {
    response.json(savedUser)
  })
    .catch(error => next(error))
})

usersRouter.put('/:id', (request, response, next) => {
  const { firstname, lastname, birthdate, email, avatar, location, website } = request.body

  User.findByIdAndUpdate(request.params.id, { firstname, lastname, birthdate, email, avatar, location, website }, { new: true, runValidators: true, context: 'query' })
    .then(updatedUser => { response.json(updatedUser) })
    .catch(error => next(error))
})

//! Reset Password step 1
usersRouter.post('/passwordReset', async (request, response) => {
  const { email } = request.body

  const user = await User.findOne({ email })
  if (!user) {
    return response.status(400).json({ error: 'User not found.' })
  }

  //*Create a new token, check if it was already created, transform to hash and save as new Token in DB
  let resetToken = crypto.randomBytes(32).toString('hex')
  const token = await Token.findOne({ userId: user.id })
  if (token) await token.deleteOne()
  const saltRounds = 10
  const hash = await bcrypt.hash(resetToken, saltRounds)

  await new Token({
    userId: user.id,
    token: hash,
    createdAt: Date.now()
  }).save()

  //*Create link with token and id to send in email to user.
  const link = `${clientURL}/#passwordReset?token=${resetToken}&id=${user.id}`
  const emailParams = {
    user_name: user.firstname + ' ' + user.lastname,
    user_email: user.email,
    message: link
  }

  emailjs
    .send(SERVICE_ID, TEMPLATE_ID, emailParams, {
      publicKey: PUBLIC_KEY,
      privateKey: PRIVATE_KEY
    })
    .then(
      function (res) {
        console.log('Success!', res.status, res.text)
      },
      function (err) {
        console.log('Failed...', err)
      }
    )
  response.end('Email sent!')
})

//! Reset Password step 2
usersRouter.post('/newPassword', async (request, response) => {

  const { userId, token, newPassword } = request.body
  let passwordResetToken = await Token.findOne({ userId })
  if (!passwordResetToken) {
    response.status(400).json({ error: 'Invalid or expired password reset token' })
  }

  const isValid = await bcrypt.compare(token, passwordResetToken.token)
  if (!isValid) {
    response.status(400).json({ error: 'Invalid or expired password reset token' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(newPassword, saltRounds)
  await User.updateOne(
    { _id: userId },
    { $set: { passwordHash } },
    { new: true }
  )

  const user = await User.findById({ _id: userId })
  const emailParams = {
    user_name: user.firstname + ' ' + user.lastname,
    user_email: user.email,
    message: 'Your password was updated succesfully.'
  }

  emailjs
    .send(SERVICE_ID, TEMPLATE_ID, emailParams, {
      publicKey: PUBLIC_KEY,
      privateKey: PRIVATE_KEY
    })
    .then((response) => {
      console.log('Success!', response.status, response.text)
    })
    .catch(error => console.log('Failed...', error))

  response.end('Password updated!')
})

usersRouter.delete('/:id', (request, response, next) => {
  User.findByIdAndRemove(request.params.id)
    // eslint-disable-next-line no-unused-vars
    .then(result => { response.status(204).end() })
    .catch(error => next(error))
})

module.exports = usersRouter