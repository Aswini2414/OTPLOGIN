const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config();
const URL = process.env.DATABASE;

const connection = async () => {
    try {
        await mongoose.connect(URL);
        console.log("Database connected successfully");
    } catch (error) {
        console.log(`Error while connecting with the database ${error}`);
    }
};

module.exports = connection;
