const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { V1: uuid } = require('uuid')
const { GraphQLError } = require('graphql')

let users = [
  {
    firstname: 'Mau',
    lastname: 'Light',
    birthdate: '1-01-01',
    email: 'maulisseluz@gmail.com',
    passwordHash: 'Qmgodfoae123.'
  }
]

const typeDefs = `
type User {
    firstname: String!
    lastname: String!
    birthdate: String!
    email: String!
    passwordHash: String!
}

type Query {
    allUsers: [User!]!
    findUser(email: String!): User
}

type Mutation {
    addUser(
        firstname: String!
        lastname: String!
        birthdate: String!
        email: String!
        passwordHash: String!
    ): User

    editUser(
        firstname: String!
        lastname: String!
        birthdate: String!
        email: String!
        passwordHash: String!
    ): User
}

`

const resolvers = {
  Query: {
    allUsers: () => users,
    findUser: (_, args) => users.find(p => p.email === args.email)
  },
  Mutation: {
    addUser: (_, args) => {
      if (users.find(u => u.email === args.email)) {
        throw new GraphQLError('Email must be unique', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.email
          }
        })
      }

      const newUser = { ...args, id: uuid() }
      users = users.concat(newUser)
      return newUser
    },
    editUser: (_, args) => {
      const user = users.find(u => u.email === args.email)
      if (!user) {
        throw new GraphQLError('User does not exist', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.email
          }
        })
      }

      const updatedUser = { ...args }
      users = users.map(u => u.email === args.email ? updatedUser : u)

    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

startStandaloneServer(server, {
  listen: { port: 4000 }
})
  .then(({ url }) => {
    console.log(`Server running at ${url}`)
  })
