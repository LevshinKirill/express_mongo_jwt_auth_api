const Router = require('express')
const authMiddleware = require('../middlewares/auth.middleware')
const User = require('../models/User')

const router = new Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    res.status(200).json({ 'message': `You are logged in ${user.userName}` })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router