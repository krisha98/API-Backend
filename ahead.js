//Create a Function to fetch data from DB in Node Js
const express = require('express');
const res = require('express/lib/response');
const app = express();

const { append } = require("express/lib/response");

console.log(post)
res.status(201).json({
    message: "post added sucessfully"
});
app.get('/api/post',(req,res,next)=>{
    postmodel.find()
    .then((documents)=>{
        console.log(documents)
    })
res.status(200).json({
    message: 'posts fetched successfully',
    posts:posts
});
});