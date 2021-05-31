require('dotenv').config();


const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");


const app = express();
app.use(express.static("public"));
app.set("view engine",'ejs');
app.use(bodyParser.urlencoded({extended:true}));


// connect to mongoose with mmongodb 
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});

const userSchema = new mongoose.Schema({
   email: String,
   password: String
});

userSchema.plugin(encrypt,{secret: process.env.SECRET, encryptedFields:['password']});


const User = mongoose.model("User",userSchema);
app.get('/',(req,res)=>{
    res.render("home",{})
})
app.get('/login',(req,res)=>{
    res.render("login",{})
})
app.get('/register',(req,res)=>{
    res.render("register",{})
})
app.get('/petition',(req,res)=>{
    res.render("petition",{})
})
app.get('/petitionlist',(req,res)=>{
    res.render("petitionlist",{})
})



app.post("/register", (req,res)=>{
    const newUser = new User({
        email: req.body.userName,
        password:req.body.password
    });
    newUser.save(err=>{
        if(err){
            console.log(err);
        }else{
            res.render("petition")
        }
    })
})

app.post("/login",(req,res)=>{
    const userName =req.body.userName;
    const password =req.body.password;

    User.findOne({email:userName},(err,foundUser)=>{
        if(err){
            console.log(err)
        }else if(foundUser.password===password){
            res.render("petition")
        }
    })
})



app.listen(3000, (req,res)=>{
    console.log("the surver is running on the  3000 port.")
})
