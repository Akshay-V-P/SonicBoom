const userModel = require("../model/userModel")

const isAuthenticated = async(req, res, next) => {
  if (!req.isAuthenticated()) return res.redirect('/login')
  
  const user = await userModel.findOne({ _id: req.session?.user?._id })
  if (user.isBlocked) {
      delete req.session.user
      return res.redirect("/login")
  }

  next()
}

const isSession = async(req, res, next) => {
  if (!req.isAuthenticated()) return next()
  
  const user = await userModel.findOne({ _id: req.session?.user?._id })
  if (user.isBlocked || !user) {
      return next()
  }
  
  res.redirect('/landing_page')
}


module.exports = {
  isAuthenticated,
  isSession,
}