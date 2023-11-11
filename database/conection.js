const mongoose = require("mongoose");
require('dotenv').config();

const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MONGODB_URI:", process.env.MONGODB_URI);
    } catch (error) {
        console.error(error)
        throw new Error("No se ah podido conectar a la base de datos")
    }
}

module.exports = {
    connection
}