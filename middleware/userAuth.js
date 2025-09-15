
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next()
  res.redirect('/login')
}

const isSession = (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect('/landing_page')
  next()
}


module.exports = {
  isAuthenticated,
  isSession,
}