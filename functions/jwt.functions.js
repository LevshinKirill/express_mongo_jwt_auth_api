require('dotenv').config()
const jwt = require('jsonwebtoken')

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' })
}

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1y' })
}

module.exports = { generateAccessToken, generateRefreshToken }