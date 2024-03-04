const mongoose = require('mongoose')

const Preregister = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
})

const PreregisterModel = mongoose.model('Preregister', Preregister)
module.exports = PreregisterModel