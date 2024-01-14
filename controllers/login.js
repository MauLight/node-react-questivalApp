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

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'Invalid username or password'
    })
  }

  const userForToken = {
    email: user.email,
    id: user._id
  }

  const token = jwt.sign(userForToken, SECRET)
  response.status(200).send({
    token,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    avatar: user.avatar || '',
    location: user.location || '',
    website: user.website || { url: '', title: 'website' },
    social: user.social || { instagram: '', linkedin: '', discord: '' },
    introduction: user.introduction,
    education: user.education,
    experience: user.experience,
    certificates: user.certificates || [],
    projects: user.projects || [],
    read: user.read || [],
    favorites: user.favorites || [],
    saved: user.saved || [],
    courses: user.courses || [],
    followers: user.followers || [],
    following: user.following || [],
    id: user.id
  })
})

module.exports = loginRouter