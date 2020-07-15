require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const createError = require('http-errors');
//const User = require('./models/user');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const moment = require('moment');
const session = require("express-session");
const app= express();

//* Connect to the database

const dbURL = `mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@ds241308.mlab.com:41308/give-india`||"mongodb://localhost/give-india";
mongoose.connect(dbURL,{useNewUrlParser: true, useCreateIndex:true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open',() =>{
  console.log("we're connected!");
});

// * Logger
logger.token('host', function(req, res) {
    return req.hostname;
});
logger.token('time', function(req, res) {
    const currentTimeStamp = moment.now();
    return currentTimeStamp;
});
app.use(logger(':method :host :url :status at :time'));

app.use(logger('dev'));
app.use(express.json()); //body-parser is now part of express inbuilt
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: 'top Secret!23',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }))

app.get('/',(req,res) => {
    res.send('root');
});

app.get('/select',(req,res)=>{
    res.send('select');
});

app.post('/save',(req,res)=>{

});

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