const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        const conn = await mongoose.connect('mongodb+srv://admin-suraj:itsgabru@clustermine.vrxpf.mongodb.net/bill?retryWrites=true&w=majority' ,{
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error){
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}

module.exports = connectDB;