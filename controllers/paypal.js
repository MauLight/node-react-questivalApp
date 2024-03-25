const axios = require('axios')
const paypalRouter = require('express').Router()
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = require('../utils/config')
const Payer = require('../models/payer')
const User = require('../models/user')

const HOST = 'https://questivalapp-node-backend-together.onrender.com/api/paypal'
const PAYPAL_API = 'https://api-m.paypal.com'
const clientURL = 'https://ctlst.pro/#'

paypalRouter.post('/create-order', async (request, response) => {
  const { id, quantity } = request.body

  const clientOrder = Array.from({ length: quantity }, () => {
    if (id === 1) {
      return {
        amount: {
          currency_code: 'USD',
          value: '99.00'
        }
      }
    }
  })

  console.log('Creating order for:', clientOrder)

  try {
    const order = {
      intent: 'CAPTURE',
      purchase_units: clientOrder,
      application_context: {
        brand_name: 'Catalyst',
        user_action: 'PAY_NOW',
        return_url: `${HOST}/capture-order`,
        cancel_url: `${HOST}/cancel-payment`,
      }
    }

    const params = new URLSearchParams()
    params.append('grant_type', 'client_credentials')

    const {
      data: { access_token },
    } = await axios.post(
      'https://api-m.sandbox.paypal.com/v1/oauth2/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: PAYPAL_CLIENT_ID,
          password: PAYPAL_CLIENT_SECRET
        },
      }
    )

    console.log(access_token)

    const res = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      order,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    )

    console.log(res.data)
    return response.json(res.data)
  }
  catch (error) {
    console.log(error)
    return response.status(500).json({ error: 'Failed to create order.' })
  }

})

paypalRouter.get('/capture-order', async (request, response) => {
  console.log('this is the payment query returned from paypal', request.query)
  const { token } = request.query
  try {
    const res = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`, {}, {
      auth: {
        username: PAYPAL_CLIENT_ID,
        password: PAYPAL_CLIENT_SECRET
      }
    })

    console.log(res.data)
    const payer = new Payer(res.data)
    await payer.save()
    response.redirect(`${clientURL}/payment-success?paymentId=${res.data.id}`)
  }
  catch (error) {
    console.log(error)
    response.status(500).json({ error: 'Internal server error.' })
  }
})

paypalRouter.post('/check-order', async (request, response) => {
  const { paymentId, id } = request.body
  console.log('1. Checking order:', paymentId)
  console.log('1. Checking userId:', id)
  const payer = await Payer.findOne({ id: paymentId })
  console.log(payer, 'this is the payer')
  if (payer) {
    console.log('2. Checking payer:', payer.id)
    const userTaken = await User.findOne({ 'register.paymentId': paymentId })
    console.log('3. Checking user:', userTaken)
    if (userTaken) {
      return response.status(404).json({ error: 'A user has already registered with this order.' })
    }

    const user = await User.findById(id)
    console.log('4. Find user:', user.firstname)
    user.register.paymentId = paymentId
    user.register.registered = true
    await user.save()
    return response.json({ validate: true })
  }
  else {
    return response.status(404).json({ error: 'Payment not found.' })
  }
})

module.exports = paypalRouter