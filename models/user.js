const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    minLength: 3,
    required: true
  },
  lastname: {
    type: String,
    minLength: 3,
    required: true
  },
  birthdate: {
    type: Date,
    min: '1923-01-01',
    required: true
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v)
      }
    }
  },
  passwordHash: {
    type: String,
    validate: {
      validator: function (v) {
        //Minimum eight characters, at least one letter, one number and one special character
        return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(v)
      }
    },
    required: true
  },
  // ! Stores an array of ObjectIds' from Project model
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }
  ],
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // ! Hide PasswordHash
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User