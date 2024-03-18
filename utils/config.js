require('dotenv').config()

const PORT = process.env.PORT
const MONGO_URL = process.env.MONGODB_URL
const SECRET = process.env.SECRET
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLENT_SECRET
const TEMPLATE_ID = process.env.TEMPLATE_ID
const PUBLIC_KEY = process.env.PUBLIC_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const SERVICE_ID = process.env.SERVICE_ID
const JWT_SECRET = process.env.JWT_SECRET
const STRIPE_PRIVATE_KEY = process.env.STRIPE_PRIVATE_KEY
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET

module.exports = {
  PORT,
  MONGO_URL,
  SECRET,
  CLIENT_ID,
  CLIENT_SECRET,
  TEMPLATE_ID,
  PUBLIC_KEY,
  PRIVATE_KEY,
  SERVICE_ID,
  JWT_SECRET,
  STRIPE_PRIVATE_KEY,
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET
}