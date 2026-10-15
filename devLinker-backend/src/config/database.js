const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI;

    await mongoose.connect(mongoURI);
};

module.exports = connectDB;