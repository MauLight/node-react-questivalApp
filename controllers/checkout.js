const checkoutRouter = require('express').Router()
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

//* Price must be in cents
const storeItems = new Map([[
  1, { priceInCents: 10000, name: 'The Quest' },
  2, { priceInCents: 20000, name: 'Learn CSS Today' }
]])

checkoutRouter.post('/', async (request, response) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',

      line_items: request.body.items.map( item => {
        const storeItem = storeItems.get(item.id)
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: storeItem.name
            },
            unit_amount: storeItem.priceInCents
          },
          quantity: item.quantity
        }
      }),
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`
    })
    response.json({ url: session.url })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }

})

module.exports = checkoutRouter