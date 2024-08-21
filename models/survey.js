const mongoose = require('mongoose')

const surveySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
})

const Survey = mongoose.model('Survey', surveySchema)
module.exports = Survey