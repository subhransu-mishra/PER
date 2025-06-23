const express = require("express");
const PORT = process.env.PORT || 3000;
const app = express();
const path = require("path");

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
app.get("/",(req,res)=>{
    res.send("Welcome to Home page!");
})