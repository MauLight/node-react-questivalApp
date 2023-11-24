const mongoose = require('mongoose')

const Myth = new mongoose.Schema({
  problem: String,
  take: String,
  concept: String,
  myth_u: String
})

const Basis = new mongoose.Schema({
  theme: String,
  truth: String,
  contrapositive: String,
  lie: String,
  flaw: String,
  wound: String,
  want: String,
  antagonism: String,
  need: String
})

const Protagonist = new mongoose.Schema({
  protagonist_u: String,
  chLogline: String,
  belief: String,
  falseBehavior: String,
  uncertainty: String,
  trueBehavior: String,
  rightAction: String,
  trueCharacter: String
})

const Opposition = new mongoose.Schema({
  objective: String,
  antagonismAnt: String,
  antagonismAll: String,
  sameObjective: String,
  distance: String,
  resolve: String
})

const projectSchema = new mongoose.Schema({
  writer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    minLength: 3,
    required: true
  },
  logline: {
    type: String,
    minLength: 100,
    required: true
  },
  genre: [
    {
      type: String,
      minLength: 3,
    }
  ],
  rating: {
    type: String
  },
  summary: {
    type: String,
    minLength: 200
  },
  myth: {
    type: Myth
  },
  basis: {
    type: Basis
  },
  protagonist: {
    type: Protagonist
  },
  opposition: {
    type: Opposition
  },
  screenplay: {
    type: String
  },
  pitch: {
    type: String
  },
  poster: {
    type: String
  },
  wallpaper: {
    type: String
  },
  readers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

const Project = mongoose.model('Project', projectSchema)
module.exports = Project