const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const bcrypt = require('bcrypt')
const userModel = require('../model/userModel')

passport.serializeUser((user, done) => {
    done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id)
        done(null, user)
    } catch (error) {
        done(error)
    }
})


// google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/user/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await userModel.findOne({ googleId: profile.id })

      if (!user) {
        user = await userModel.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value
        })
        }
        
        if (user.isBlocked) {
            return done(null, false, {message:'Your account has been blocked by administrator'})
        }
        await user.save()

      return done(null, user)
    } catch (err) {
      return done(err)
    }
  }
))

module.exports = passport