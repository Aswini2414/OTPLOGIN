const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();
const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Not valid Email");
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [
        {
            token: {
                type: String,
                required:true,
            }
        }
    ]
});

//hash password
customerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});



//token generate
customerSchema.methods.generateAuthtoken = async function () {
    try {
        let newToken = jwt.sign({ _id: this._id }, process.env.SECRET_KEY, {
            expiresIn:"1d"
        });

        this.tokens = this.tokens.concat({ token: newToken });
        await this.save();
        return newToken;

    } catch (error) {
        resizeBy.status(400).json(error);
    }
}



const customer = new mongoose.model('customers', customerSchema);

module.exports = customer;