const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql')
const { v1: uuid } = require('uuid')

let people = [
  {
    name: 'Arto Hellas',
    phone: '040-123543',
    street: 'Tapiolankatu 5 A',
    city: 'Espoo',
    id: '3d594650-3436-11e9-bc57-8b80ba54c431'
  },
  {
    name: 'Matti Luukkainen',
    phone: '040-432342',
    street: 'Malminkaari 10 A',
    city: 'Helsinki',
    id: '3d599470-3436-11e9-bc57-8b80ba54c431'
  },
  {
    name: 'Venla Ruuska',
    street: 'Nallemäentie 22 C',
    city: 'Helsinki',
    id: '3d599471-3436-11e9-bc57-8b80ba54c431'
  },
]

const typeDefs = `
type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
}

type Address {
  street: String!
  city: String!
}

type Query {
    allPeople: [Person!]!
    findPerson(name: String!): Person
}

type Mutation {
  addPerson( 
    name: String! 
    phone: String 
    street: String! 
    city: String! 
    ): Person
  
  editNumber(
    name: String!
    phone: String!
  ): Person
}

`

const resolvers = {
  Query: {
    allPeople: () => people,
    findPerson: (_, args) => people.find(p => p.name === args.name)
  },
  //! Because Person doesn't have an address field, we need to create a resolver for it.
  Person: {
    //* In here, root means the person object.
    address: (root) => {
      return {
        street: root.street,
        city: root.city
      }
    }
  },
  Mutation: {
    addPerson: (_, args) => {
      if (people.find(p => p.name === args.name)) {
        throw new GraphQLError('Name of user must be unique', {
          extensions: {
            code: 'BAD_USER_INPUT',
            //! this is the variable that triggers the error
            invalidArgs: args.name
          }
        })
      }
      const newPerson = { ...args, id: uuid() }
      people = people.concat(newPerson)
      return newPerson
    },
    editNumber: (_, args) => {
      const person = people.find(p => p.name === args.name)
      if (!person) {
        throw new GraphQLError('User does not exist', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name
          }
        })
      }

      const updatedPerson = { ...person, phone: args.phone }
      people = people.map(p => p.name === args.name ? updatedPerson : p)
      return updatedPerson
    }
  }
}

//* Apollo server receives typeDefs (schema) and resolvers for the queries (how to solve them).
const server = new ApolloServer({
  typeDefs,
  resolvers
})

startStandaloneServer(server, {
  listen: { port: 4000 }
})
  .then(({ url }) => {
    console.log(`Server ready at ${url}`)
  })