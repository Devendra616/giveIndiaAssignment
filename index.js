require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const createError = require('http-errors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const moment = require('moment');

const bodyParser = require('body-parser');
const session = require("express-session");
const methodOverride = require('method-override');
const app= express();

const seedDb = require('./seed');
const Account = require('./models/account');
const User = require('./models/user');

//* Connect to the database 
//const dbURI = `mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DATABASEURL}?retryWrites=false`||"mongodb://localhost/give-india";
const dbURI = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@cluster0.ebnom.mongodb.net/give-india?retryWrites=true&w=majority`;
mongoose.connect(dbURI,{useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology:true,useFindAndModify:false});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open',() =>{
  console.log("We're connected to the database!");
});

app.use(methodOverride("_method"));

app.use(logger('dev'));
app.use(express.json()); //body-parser is now part of express inbuilt
//app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: 'top Secret!23',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }));

app.use(bodyParser.urlencoded({extended:true}));

// seed the database, uncomment to provide initial data
//seedDb();


// * Logger
logger.token('host', function(req, res) {
    return req.hostname;
});
logger.token('time', function(req, res) {
    const currentTimeStamp = moment.now();
    return currentTimeStamp;
});
app.use(logger(':method :host :url :status at :time'));

async function transfer(fromAccountId, toAccountId, amount) {
    const session = await mongoose.startSession();
    const options= {session, new:true}
    let sourceAccount, destinationAccount;
    const BASICSAVNGS_MAX_BALANCE = 1500;

    if(fromAccountId === toAccountId) {
        console.log('Can not send to same account');
        return;
    }

    // Check if the account belongs to same user
    try{
         sourceAccount = await Account.findOne({accountNo:fromAccountId});
         destinationAccount =await Account.findOne({accountNo:toAccountId});
        
        if(sourceAccount.user.id.equals(destinationAccount.user.id)) {
            console.log('Can not transfer between accounts belonging to same user');
            return;
        }
    }catch(err) {
        console.log('Some error occured!');
        throw err;
    }

    // If users are different try transfer 
    session.startTransaction();
    try {
        const source= await Account.findByIdAndUpdate(
            {_id:sourceAccount._id},
            {$inc:{balance:-amount}},
            options
        );
    
        if(source.balance <0) {
            // Source account should have the required amount for the transaction to succeed
            throw new Error('Insufficient Balance with Sender:');
        }
        
        const destination = await Account.findByIdAndUpdate(
            {_id:destinationAccount._id},
            {$inc:{balance:amount}},
            options
        ); 

        // The balance in ‘BasicSavings’ account type should never exceed Rs. 50,000
        if((destination.accountType.name === 'BasicSavings') && (destination.balance > BASICSAVNGS_MAX_BALANCE)) {
            throw new Error(`Recepient's maximum account limit reached`);
        }
        await session.commitTransaction();
        const result = {
            newSrcBalance: source.balance,
            totalDestBalance:0,
            transferedAt:moment.now()
        }
        session.endSession();
    }
     catch (error) {
        // Abort transaction and undo any changes
        await session.abortTransaction();
        session.endSession();
        throw error;
    } 
}


app.get('/',(req,res) => {
    res.send('root');
});

app.post("/transferAmount", async (req,res) => {

    const {fromAccountId,toAccountId,amount} = req.body;
    
    let errMsg;
 
    if(!fromAccountId) {
        errMsg += "Source Account missing. ";
        console.log(`Error!, ${errMsg}`);
    }
    if(!toAccountId) {
        errMsg += "Destination Account missing. ";
        console.log(`Error!, ${errMsg}`);
    }
    if(!amount) {
        errMsg += "Amount missing. ";
        console.log(`Error!, ${errMsg}`);
    }

    if(errMsg) {
        res.send(`Rectify the error and then proceed \n ${errMsg}`)
    }
    else {
        transfer(fromAccountId, toAccountId, amount);
    }


})

//! catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

//! error handler by express for default usage
app.use(function(err, req, res, next) {
    console.log(err);
  req.session.error = err.message;
  //res.redirect('back');
  res.send('Wrong path')
});

const PORT = process.env.PORT ||3000;
app.listen(PORT, ()=> {
    console.log(`Server started on port: ${PORT}` );
});