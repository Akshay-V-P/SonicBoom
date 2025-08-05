require('dotenv').config() 
const express = require('express')
const userRoute = require('./routes/user')
const adminRoute = require('./routes/admin')
const path = require('path')
const app = express()

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use('/user', userRoute)
app.use('/admin', adminRoute)

app.listen(process.env.PORT, ()=> console.log(`Server is listening on port ${process.env.PORT}`))
