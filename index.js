require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const createError = require('http-errors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require("express-session");
//const methodOverride = require('method-override');
const moment = require('moment');
const app= express();

const seedDb = require('./seed');
const Account = require('./models/account');
const User = require('./models/user');

const {handleError, ErrorHandler} = require('./helpers/error');
const transferAmount = require('./helpers/transferAmount');

//* Connect to the database 
//const dbURI = `mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DATABASEURL}?retryWrites=false`||"mongodb://localhost/give-india";
const dbURI = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@cluster0.ebnom.mongodb.net/give-india?retryWrites=true&w=majority`;
try{
    mongoose.connect(dbURI,{useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology:true,useFindAndModify:false});
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open',() =>{
    console.log("We're connected to the database!");
    });
} catch(err) {
    console.log('Connection error',err);
    throw new ErrorHandler(404,'Database connection error');
}

//app.use(methodOverride("_method"));

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

app.get('/',(req,res) => {
    res.send('root');
});

app.post("/transferAmount", async (req,res,next) => {
    const {fromAccountId,toAccountId,amount} = req.body;    
    let errMsg='';      
    
    try {        
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
            if(errMsg.length>0) {
                throw new ErrorHandler(404,errMsg);
            } else {
                const result = await transferAmount(fromAccountId, toAccountId, amount);
                console.log(result)
                res.json(result);        
            }
        } catch(err){
            next(err)            
        }   
});

//! catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

//! error handler by express for default usage
app.use(handleError);

const PORT = process.env.PORT ||3000;
app.listen(PORT, ()=> {
    console.log(`Server started on port: ${PORT}` );
});