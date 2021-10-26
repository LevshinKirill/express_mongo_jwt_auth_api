const Router = require('express')
const { check, validationResult } = require('express-validator')
const { generateAccessToken, generateRefreshToken } = require('../functions/jwt.functions')
const User = require('../models/User')
const Token = require('../models/Token')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const router = new Router()

router.post('/signUp',
  [
    check('userName', 'Name can\'t be empty').notEmpty(),
    check('password', 'Password must be more than 4 and less than 10 characters').isLength({ min: 4, max: 10 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Incorrect data entered', errors })
      }
      const { userName, password } = req.body
      const candidate = await User.findOne({ userName })
      if (candidate) {
        return res.status(400).json({ message: 'A user with the same name already exists' })
      }
      const hashPassword = bcrypt.hashSync(password, 7)
      const user = new User({ userName: userName, password: hashPassword })
      await user.save()
      const payload = { userId: user._id }
      const accessToken = generateAccessToken(payload)
      const refreshToken = generateRefreshToken(payload)
      await new Token({ refreshToken: refreshToken, user: user }).save()
      res.json({ accessToken: accessToken, refreshToken: refreshToken })
    } catch (e) {
      console.log(e)
      res.status(500).json({ message: 'Server error' })
    }
  })

router.post('/signIn', async (req, res) => {
  try {
    const { userName, password } = req.body
    const user = await User.findOne({ userName })
    if (!user) {
      return res.status(400).json({ message: `User ${userName} doesn't exist` })
    }
    const validPassword = bcrypt.compareSync(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ message: `Wrong password entered` })
    }
    const payload = { userId: user._id }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)
    await new Token({ refreshToken: refreshToken, user: user }).save()
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
  }
  catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/refreshAccessToken', async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken
    if (refreshToken == null) return res.sendStatus(401)
    if (await !Token.findOne({ 'refreshToken': refreshToken })) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403)
      const accessToken = generateAccessToken({ userId: user.userId })
      res.json({ accessToken: accessToken })
    })
  }
  catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/signOut', async (req, res) => {
  try {
    await Token.findOneAndDelete({ token: req.body.token })
    res.sendStatus(204)
  }
  catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router