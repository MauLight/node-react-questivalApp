const bcrypt = require('bcrypt')

const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (_, response) => {
  const users = await User.find({}).populate('projects')
  response.json(users)
})

usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id).populate('projects')
  if (user) {
    response.json(user)
  }
  else {
    response.status(404).end()
  }
})

usersRouter.post('/', async (request, response, next) => {
  const { firstname, lastname, email, birthdate, password } = request.body

  const savedUser = User.find({ email })
  if(savedUser.length > 0) {
    return response.status(401).json({
      error: 'username is already taken.'
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
  const { username, password } = request.body

  User.findByIdAndUpdate(request.params.id, { username, password }, { new: true, runValidators: true, context: 'query' })
    .then(updatedUser => { response.json(updatedUser) })
    .catch(error => next(error))
})

usersRouter.delete('/:id', (request, response, next) => {
  User.findByIdAndRemove(request.params.id)
    // eslint-disable-next-line no-unused-vars
    .then(result => { response.status(204).end() })
    .catch(error => next(error))
})

module.exports = usersRouter