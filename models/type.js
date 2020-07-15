const mongoose = require('mongoose');   

var AccountTypeSchema = new mongoose.Schema({
    name: String,
    description: String  
});

module.exports = mongoose.model('AccountType',AccountTypeSchema);