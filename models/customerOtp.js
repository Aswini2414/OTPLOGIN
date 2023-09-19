const mongoose = require("mongoose");
const validator = require("validator");

const customerOtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Not valid Email');
            }
        }
    },
    otp: {
        type: String,
        required: true
    }
});

//customer otp model
const customerotp = new mongoose.model('customerOtps', customerOtpSchema);

module.exports = customerotp;