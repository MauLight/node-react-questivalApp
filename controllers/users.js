const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const emailjs = require('@emailjs/nodejs')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Token = require('../models/token')
// eslint-disable-next-line no-unused-vars
const { _, __, SECRET, _____, ______, TEMPLATE_ID, PUBLIC_KEY, PRIVATE_KEY, SERVICE_ID } = require('../utils/config')

// const clientURL = 'https://localhost:3000'
const clientURL = 'https://ctlst.io'

//* Get All Users
usersRouter.post('/', async (request, response) => {
  const token = request.body.token
  if (!token) return response.status(400).json({ error: 'No token provided.' })
  const decodedToken = jwt.verify(token, SECRET)
  if (!decodedToken) response.status(400).json({ error: 'Bad Credentials.' })

  const users = await User.find({}).populate('following').populate('followers')
  return response.json(users)
})

//* Check a Specific User
usersRouter.post('/userexists', async (request, response) => {
  const { email } = request.body

  const userExists = await User.findOne({ email })
  if (!userExists) {
    console.log('ready to sign up!')
    return response.json({ check: false })
  }
  else {
    return response.json({ check: true, user: userExists })
  }
})

//* Get a Specific User
usersRouter.post('/user', async (request, response) => {
  const verifyToken = jwt.verify(request.body.token, SECRET)
  if (!verifyToken) response.status(400).json({ error: 'Bad Credentials.' })

  const { id } = request.body

  const user = await User.findById(id).populate('following').populate('followers')
  if (user) {
    return response.json(user)
  }
  else {
    return response.status(404).end()
  }
})

//* Get a Specific other User
usersRouter.post('/visitinguser', async (request, response) => {
  const verifyToken = jwt.verify(request.body.token, SECRET)
  if (!verifyToken) response.status(400).json({ error: 'Bad Credentials.' })

  const id = request.body.id

  const user = await User.findById(id).populate('following').populate('followers')
  console.log(user)
  if (user) {
    return response.json(user)
  }
  else {
    return response.status(404).end()
  }
})

//* Post a New User
usersRouter.post('/sign', async (request, response, next) => {
  const { username, email, password, course } = request.body
  const savedUser = await User.find({ email })
  if (savedUser.length > 0) {
    return response.status(401).json({
      error: 'Email is already taken.'
    })
  }

  const isPasswordInvalid = /^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/.test(password)
  if (isPasswordInvalid) {
    return response.status(401).json({
      error: 'Password must contain at least 8 characters, one uppercase, one lowercase, one special character and at least one number.'
    })
  }
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  let user

  if (course === '') {
    user = new User({
      username,
      email,
      passwordHash
    })
  } else {
    user = new User({
      username,
      email,
      passwordHash,
      register: {
        registered: false,
        course,
        paymentId: ''
      }
    })
  }

  if (username === undefined || email === undefined || password === undefined) {
    return response.status(400).json({ error: 'Fields are missing' })
  }

  user.save().then(savedUser => {
    response.json(savedUser)
  })
    .catch(error => next(error))
})

//* Update a User
usersRouter.put('/:id', (request, response, next) => {
  const decodedToken = jwt.verify(request.body.token, SECRET)
  if (!decodedToken) response.status(400).json({ error: 'Bad Credentials.' })

  const { username, introduction, location, website } = request.body.userInformation

  User.findByIdAndUpdate(request.params.id, { username, introduction, location, website }, { new: true, runValidators: true, context: 'query' })
    .then(updatedUser => { response.json(updatedUser) })
    .catch(error => next(error))
})

//* Update a User profile pic
usersRouter.put('/profilepic/:id', (request, response, next) => {
  const decodedToken = jwt.verify(request.body.token, SECRET)
  if (!decodedToken) response.status(400).json({ error: 'Bad Credentials.' })

  const { avatar } = request.body

  User.findByIdAndUpdate(request.params.id, { avatar }, { new: true, runValidators: true, context: 'query' })
    .then(updatedUser => { response.json(updatedUser) })
    .catch(error => next(error))
})

//* Update a User profile banner
usersRouter.put('/profilebanner/:id', (request, response, next) => {
  const decodedToken = jwt.verify(request.body.token, SECRET)
  if (!decodedToken) response.status(400).json({ error: 'Bad Credentials.' })

  const { banner } = request.body

  User.findByIdAndUpdate(request.params.id, { banner }, { new: true, runValidators: true, context: 'query' })
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
  const link = `${clientURL}/newpassword?token=${resetToken}&id=${user.id}`
  const emailParams = {
    user_name: user.username,
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
  const decodedToken = jwt.verify(request.body.token, SECRET)
  if (!decodedToken) response.status(400).json({ error: 'Bad Credentials.' })

  User.findByIdAndRemove(request.params.id)
    // eslint-disable-next-line no-unused-vars
    .then(result => { response.status(204).end() })
    .catch(error => next(error))
})

//* Follow a user
usersRouter.put('/', async (request, response) => {
  const decodedToken = jwt.verify(request.body.token, SECRET)
  if (!decodedToken) response.status(400).json({ error: 'Bad Credentials.' })

  const { userToFollowId, myId } = request.body

  if (userToFollowId === myId) {
    response.status(400).json({ error: 'User can\'t follow themselves' })
    return
  }

  let myUser = await User.findById(myId)

  const checkFollowing = myUser.following.filter(elem => elem._id.toString() === userToFollowId)
  if (checkFollowing.length > 0) {
    response.status(400).json({ error: 'Current User already follows this user.' })
    return
  }

  const userToFollow = await User.findById(userToFollowId)

  await User.findByIdAndUpdate(userToFollowId, { followers: userToFollow.followers.concat(myUser) })
  await User.findByIdAndUpdate(myId, { following: myUser.following.concat(userToFollow) })

  myUser = await User.findById(myId)

  response.status(200).json(myUser)
})

//* Unfollow a user
usersRouter.post('/update', async (request, response) => {
  const decodedToken = jwt.verify(request.body.token, SECRET)
  if (!decodedToken) response.status(400).json({ error: 'Bad Credentials.' })

  const { userToFollowId, myId } = request.body

  let myUser = await User.findById(myId)

  const userToUnfollow = await User.findById(userToFollowId)
  console.log('this is the user to unfollow', userToUnfollow)

  await User.findByIdAndUpdate(userToFollowId, { followers: userToUnfollow.followers.filter(elem => elem._id.toString() !== myId) })
  await User.findByIdAndUpdate(myId, { following: myUser.following.filter(elem => elem._id.toString() !== userToFollowId) })

  myUser = await User.findById(myId)
  console.log('this is my updated user', myUser.following)

  response.status(200).json(myUser)
})

module.exports = usersRouter