const mongoose = require('mongoose')

const Website = new mongoose.Schema({
  url: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  }
})
const Social = new mongoose.Schema({
  instagram: {
    type: String,
    default: ''
  },
  linkedin: {
    type: String,
    default: ''
  },
  discord: {
    type: String,
    default: ''
  }
})

const Certificate = new mongoose.Schema({
  title: String,
  url: String,
})

const userSchema = new mongoose.Schema({

  //* Basic Information
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
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,5}$/.test(v)
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

  //* Additional Information
  avatar: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  website: {
    type: Website,
    default: ''
  },
  social: {
    type: Social,
  },

  //* Profile information
  introduction: {
    type: String,
    default: ''
  },
  education: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    default: ''
  },
  certificates: {
    type: Certificate
  },

  // ! Stores an array of ObjectIds' from Project model
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }
  ],
  read: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }
  ],
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }
  ],
  saved: [
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