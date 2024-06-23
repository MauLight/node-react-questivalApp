const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
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
      required: true
    },
    filePath: {
      type: String,
      required: true
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