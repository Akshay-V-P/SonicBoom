const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL, {})
        console.log(`MongoDb connected ${conn.connection.host}`)
    } catch (error) {
        console.log(error)
    }
}

module.exports = connectDB