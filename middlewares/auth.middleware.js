require('dotenv').config()
const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    next()
  }
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.userId = user.userId
    next()
  })
}

module.exports = authMiddleware