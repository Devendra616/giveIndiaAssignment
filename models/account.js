const mongoose = require('mongoose');   

var AccountSchema = new mongoose.Schema({
    accountNo: { type: String, unique: true, required: true },
    accountType: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"AccountType"
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