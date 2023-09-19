const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connection = require("./database/db.js");
const router = require('./Routes/route.js');

const PORT = process.env.PORT|| 8000;

//Middlewares
app.use(express.json());
app.use(cors());
app.use(router);

connection();

app.listen(PORT, () => {
    console.log(`Server is running on the port ${PORT}`);
});
