const mongoose = require('mongoose');   

var AccountSchema = new mongoose.Schema({
    accountNo: { type: String, unique: true, required: true },
    accountType: {
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"AccountType"
        },
        name:String
    },
    user: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"            
        },
        name: 'String'
    },
    balance: Number,
});

module.exports = mongoose.model('Account',AccountSchema);