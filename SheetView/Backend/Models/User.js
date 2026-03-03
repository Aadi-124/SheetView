const mongoose = require("mongoose");


const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        length: 4,
    },
    profilePic: {
        data: Buffer,
        contentType: String,
    }

});

const User = mongoose.model("user", UserSchema);

module.exports = User;





