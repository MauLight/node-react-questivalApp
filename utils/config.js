require('dotenv').config()

const PORT = process.env.PORT
const MONGO_URL = process.env.MONGODB_URL
const SECRET = process.env.SECRET
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLENT_SECRET

module.exports = {
  PORT,
  MONGO_URL,
  SECRET,
  CLIENT_ID,
  CLIENT_SECRET
}