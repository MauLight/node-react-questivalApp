const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const { SECRET } = require('../utils/config')

loginRouter.post('/', async (request, response) => {

  const { email, password } = request.body

  //! Find the user who's email matches the request
  const user = await User.findOne({ email })
  //! Use compare function to check if password is correct
  const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if(!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'Invalid username or password'
    })
  }

  const userForToken = {
    email: user.email,
    id: user._id
  }

  const token = jwt.sign(userForToken, SECRET)
  response.status(200).send({ token, email: user.email, firstname: user.firstname, lastname: user.lastname, id: user.id })
})

module.exports = loginRouter