const mongoose = require("mongoose");
const ContactSchema = new mongoose.Schema({
    FullName:{
        type: String,
        required: true,
        
    },
    Email:{
        required: true,
        type: String,
        unique: true,
    },
    Subject:{
        type: String,
        required: true,
    },
    Message:{
        type: String,
        required: true,
    }
})

module.exports = mongoose.model("Contact", ContactSchema);
