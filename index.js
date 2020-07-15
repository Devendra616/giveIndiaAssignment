require('dotenv').config();

const express = require('express');
const app= express();

app.get('/',(req,res) => {
    res.send('root');
});

app.get('/select',(req,res)=>{
    res.send('select');
});

app.post('/save',(req,res)=>{
    
})

const PORT = process.env.PORT ||3000;
app.listen(PORT, ()=> {
    console.log(`Server started on port: ${PORT}` );
});