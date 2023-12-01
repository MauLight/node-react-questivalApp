const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const emailjs = require('@emailjs/nodejs')
// const clientURL = 'http://localhost:5173/test'
const clientURL = 'https://screenwriters.quest/test'

// eslint-disable-next-line no-unused-vars
const { PORT, MONGO_URL, _, __, ___, TEMPLATE_ID, PUBLIC_KEY, PRIVATE_KEY, SERVICE_ID, JWT_SECRET } = require('./utils/config')
const User = require('./models/user')
const Token = require('./models/token')
const mongoose = require('mongoose')

//!Connect to MongoDB
mongoose.set('strictQuery', false)
console.log('connecting to', MONGO_URL)

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('errorconnecting to MongoDb:', error.message)
  })

const typeDefs = `
type User {
    firstname: String!
    lastname: String!
    birthdate: String!
    email: String!
    passwordHash: String!
    projects: [Project!]!
    following: [User!]!
}

type Token {
  token: String!
  email: String!
  firstname: String!
  lastname: String!
}

type Message {
  message: String!
}

type Project {
  title: String!
  poster: String!
}

type Query {
    allUsers: [User!]!
    findUser(email: String!): User
    currentUser: User
}

type Mutation {
    addUser(
        firstname: String!
        lastname: String!
        birthdate: String!
        email: String!
        passwordHash: String!
    ): User

    login(
      email: String!
      password: String!
    ): Token

    passwordReset(
      email: String!
    ): Message

    passwordReset2(
      userId: String!
      token: String!
      newPassword: String! 
    ): Message

    followUser(
      emailToFollow: String!
    ): User

    editUser(
        firstname: String!
        lastname: String!
        birthdate: String!
        email: String!
    ): User

    addProject(
      title: String!
      poster: String!
    ): Project
}

`

const resolvers = {
  Query: {
    // eslint-disable-next-line no-unused-vars
    allUsers: async (_, __) => User.find({}),
    findUser: async (_, args) => User.findOne({ email: args.email }),
    currentUser: async (_, __, { currentUser }) => {
      return currentUser
    }
  },
  Mutation: {
    addUser: async (_, args) => {

      const user = User.findOne({ email: args.email })

      if (user) {
        throw new GraphQLError('Email must be unique.', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.email
          }
        })
      }

      const saltRounds = 10
      const passwordHash = await bcrypt.hash(args.password, saltRounds)

      const newUser = new User({ ...args, passwordHash })
      try {
        await newUser.save()
      }
      catch (error) {
        throw new GraphQLError('Saving new user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.email, error
          }
        })
      }

      return newUser
    },

    login: async (_, args) => {
      const user = User.findOne({ email: args.email })
      const correctPassword = user === null ? false : await bcrypt.compare(args.password, user.passwordHash)

      if (!(user && correctPassword)) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.email
          }
        })
      }

      const userForToken = {
        email: user.email,
        id: user._id
      }

      return {
        token: jwt.sign(userForToken, JWT_SECRET),
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      }

    },

    passwordReset: async (_, args) => {
      const user = User.findOne({ email: args.email })
      if (!user) {
        throw new GraphQLError('User does not exist.', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.email
          }
        })
      }

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
      return {
        message: 'We send you a reset link to ${user.email}!'
      }
    },

    passwordReset2: async (_, args) => {

      let passwordResetToken = await Token.findOne({ userId: args.userId })
      if (!passwordResetToken) {
        throw new GraphQLError('invalid or expired password reset token', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.token
          }
        })
      }

      const isValid = await bcrypt.compare(args.token, passwordResetToken.token)
      if (!isValid) {
        throw new GraphQLError('invalid or expired password reset token', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.token
          }
        })
      }

      const saltRounds = 10
      const passwordHash = await bcrypt.hash(args.newPassword, saltRounds)

      await User.updateOne(
        { _id: args.userId },
        { $set: { passwordHash } },
        { new: true }
      )

      const user = await User.findById({ _id: args.userId })
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

      return {
        message: 'Password updated!'
      }

    },

    editUser: (_, args, { currentUser }) => {

      if (!currentUser) {
        throw new GraphQLError('User not authenticated.', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const user = User.findOne({ email: args.email })
      if (!user) {
        throw new GraphQLError('User does not exist', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.email
          }
        })
      }

      const updatedUser = new User({ ...args })
      return updatedUser.save()
    },

    followUser: async (_, args, { currentUser }) => {

      if (!currentUser) {
        throw new GraphQLError('User not authenticated.', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const following = (userToFollow) => {
        currentUser.following.map(f => f._id.toString().includes(userToFollow._id.toString()))
      }

      const userToFollow = User.findOne({ email: args.emailToFollow })

      if (!following(userToFollow)) {
        currentUser.following = currentUser.following.concat(userToFollow)
      }

      try {
        await currentUser.save()
      }
      catch (error) {
        throw new GraphQLError('Follow user failed.', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.email
          }
        })
      }

      return currentUser

    },

    addProject: (_, args) => {
      const user = User.find({ email: args.email })
      if (!user) {
        throw new GraphQLError('User does not exist', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.email
          }
        })
      }

      const userProject = user.projects.find(p => p.title === args.title)
      if (userProject) {
        throw new GraphQLError('Title already exists.', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title
          }
        })
      }

      const project = {
        title: args.title,
        poster: args.poster
      }
      user.projects = user.projects.concat(project)
      return project
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
      const currentUser = await User.findOne({ email: decodedToken.email }).populate('following')
      return { currentUser }
    }
  }
})
  .then(({ url }) => {
    console.log(`Server running at ${url}`)
  })
