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
    fileUrl: {
      type: String,
    },
    filePath: {
      type: String,
    }
  },
  email: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  paragraph: {
    type: String,
    required: true
  },
  imageUrl: {
    fileUrl: {
      type: String,
    },
    filePath: {
      type: String,
    }
  },
  created_at: {
    type: String,
    required: true
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
})

const Post = mongoose.model('Post', postSchema)
module.exports = Post