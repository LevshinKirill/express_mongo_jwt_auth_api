const Router = require('express')
const authMiddleware = require('../middlewares/auth.middleware')
const User = require('../models/User')

const router = new Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    res.status(200).json({ 'userName': user.userName })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/changeName', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, { $set: { userName: req.body.userName } }, { useFindAndModify: false, new: true })
    res.status(200).json({ 'userName': user.userName })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Server error' })
  }
})



module.exports = router