const mongoose = require('mongoose');   

// A user can have multiple accounts
var UserSchema = new mongoose.Schema({
    name: String,
    pan: { type: String, unique: true, required: true},
    accounts:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account" 
        }
    ]
});

module.exports = mongoose.model('User',UserSchema);