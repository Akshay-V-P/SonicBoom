
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next()
  res.redirect('/admin/login')
}

const isSession = (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect('/admin/dashboard')
  next()
}


module.exports = {
  isAuthenticated,
  isSession,
}