const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  comment: {
    type: String,
    required: true
  },
  userAvatar: {
    fileUrl: {
      type: String,
    },
    filePath: {
      type: String,
    }
  },
  username: {
    type: String,
  }
})

const Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment