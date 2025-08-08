require('dotenv').config() 
const express = require('express')
const userRoute = require('./routes/user')
const adminRoute = require('./routes/admin')
const path = require('path')
const app = express()
const session = require('express-session')
const connectDB = require('./db/connectDB')
const passport = require('passport')

require('./config/passport')

// session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge:24*60*60*1000
    }
}))

app.use(passport.initialize())
app.use(passport.session())


// view engine
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))
// public file
app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({extended:true}))

// Routes
app.use('/user', userRoute)
app.use('/admin', adminRoute)

connectDB()
app.listen(process.env.PORT, ()=> console.log(`Server is listening on port ${process.env.PORT}`))
