const PreRegister = require('../models/preregister')
const PreRegisterRouter = require('express').Router()

PreRegisterRouter.post('/', async (request, response) => {
  const body = request.body
  const preregister = new PreRegister({
    email: body.email,
    name: body.name
  })
  const savedPreregister = await preregister.save()
  response.json(savedPreregister)
})

PreRegisterRouter.get('/', async (request, response) => {
  const preregister = await PreRegister.find({})
  response.json(preregister)
})

module.exports = PreRegisterRouter