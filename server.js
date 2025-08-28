require('dotenv').config() 
const express = require('express')
const userRoute = require('./routes/user')
const adminRoute = require('./routes/admin')
const path = require('path')
const app = express()
const session = require('express-session')
const connectDB = require('./db/connectDB')
const passport = require('passport')
const nocache = require('nocache')
const attachUser = require('./middleware/attachUser')
const hbs = require('hbs')


// test


require('./config/passport')
app.use(nocache())
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

app.use(attachUser)


// hbs helpers
hbs.registerHelper('inc', function(value) {
    return parseInt(value) + 1;
});

hbs.registerHelper('dec', function(value) {
    return parseInt(value) - 1;
});

hbs.registerHelper('or', function(a, b) {
    return a || b;
});

hbs.registerHelper("ls", (a, b) => a < b);
hbs.registerHelper("gt", (a, b) => a > b);
hbs.registerHelper("eq", (a, b) => a.toString() === b.toString());

// view engine
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))
// public file
app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// --------- Development codes ------------

// ----------------------------------------

// Routes
app.use('/user', userRoute)
app.use('/admin', adminRoute)
app.get('/',(req, res)=> {
    res.redirect('/user/login')
})

connectDB()
app.listen(process.env.PORT, ()=> console.log(`Server is listening on port ${process.env.PORT}`))
