const Survey = require('../models/survey')
const surveyRouter = require('express').Router()

surveyRouter.get('/', async (request, response) => {
  const surveys = await Survey.find({})
  response.json(surveys)
})

surveyRouter.post('/', async (request, response) => {
  const { name, age, location, experience } = request.body

  if (!name || !age || !location || !experience) {
    return response.status(400).json({
      error: 'missing required fields'
    })
  }

  const survey = new Survey({
    name: name,
    age: age,
    location: location,
    experience: experience
  })

  const savedSurvey = await survey.save()
  response.json(savedSurvey)
})

module.exports = surveyRouter