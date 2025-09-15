
const isAuthenticated = (req, res, next) => {
  if (req.session.admin) return next()
  res.redirect('/admin/login')
}

const isSession = (req, res, next) => {
  if (req.session.admin) return res.redirect('/admin/dashboard')
  next()
}


module.exports = {
  isAuthenticated,
  isSession,
}