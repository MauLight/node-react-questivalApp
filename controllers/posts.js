const postsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const { SECRET } = require('../utils/config')
const Post = require('../models/post')
const Comment = require('../models/comment')
const User = require('../models/user')

//* Get all posts
postsRouter.get('/', async (request, response) => {
  const posts = await Post.find({})
  response.json(posts)
})

//* Get a specific post
postsRouter.get('/:id', async (request, response) => {
  const post = await Post.findById(request.params.id)
  response.json(post)
})

//* Post a new post
postsRouter.post('/', async (request, response) => {
  const decodedToken = jwt.verify(request.body.token, SECRET)
  if (!decodedToken) response.status(400).json({ error: 'Bad Credentials.' })

  const { title, paragraph, imageUrl, created_at, userId, genres } = request.body

  if (title === '' || paragraph === '' || created_at === '' || userId === '' || genres.length === 0) {
    return response.status(401).json({
      error: 'Please add all fields before submitting.'
    })
  }

  const user = await User.findById(userId)
  if (!user) {
    return response.status(401).json({
      error: 'User not found.'
    })
  }

  const post = new Post({
    title,
    paragraph,
    imageUrl,
    created_at,
    userId,
    username: user.username,
    email: user.email,
    avatar: user.avatar
  })

  const savedPost = await post.save()
  response.json(savedPost)
})

//* Delete a post
postsRouter.delete('/:id', async (request, response) => {
  await Post.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

//* Get all comments for a post
postsRouter.get('/:id/comments', async (request, response) => {
  const comments = await Comment.find({ post: request.params.id })
  response.json(comments)
})

//* Post a comment
postsRouter.post('/comment', async (request, response) => {
  const decodedToken = jwt.verify(request.body.token, SECRET)
  if (!decodedToken) response.status(400).json({ error: 'Bad Credentials.' })
  const { comment } = request.body
  const userWhoComments = await User.findById(comment.user)
  console.log('this is the user who comments', userWhoComments)
  const newComment = new Comment({ ...comment, userAvatar: userWhoComments.avatar, username: userWhoComments.username })
  const savedComment = await newComment.save()
  const post = await Post.findById(comment.post)
  post.comments = post.comments.concat(savedComment)
  await post.save()
  response.json(savedComment)
})

module.exports = postsRouter