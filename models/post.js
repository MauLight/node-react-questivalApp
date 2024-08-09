const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  username: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  title: {
    type: String,
    required: true
  },
  paragraph: {
    type: String,
    required: true
  },
  genres: [
    {
      type: String
    }
  ],
  imageUrl: {
    type: String,
    required: true
  },
  pdfUrl: {
    type: String
  },
  created_at: {
    type: String,
    required: true
  }
})

const Post = mongoose.model('Post', postSchema)
module.exports = Post