require('dotenv').config();


const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 =require("md5");
const bcrypt= require("bcrypt")
const saltRounds =10;
const app = express();
app.use(express.static("public"));
app.set("view engine",'ejs');
app.use(bodyParser.urlencoded({extended:true}));


// connect to mongoose with mmongodb 
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true,useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
   email: String,
   password: String
});

// userSchema.plugin(encrypt,{secret: process.env.SECRET, encryptedFields:['password']});


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
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        
    const newUser = new User({
        email: req.body.userName,
        password: hash
    });
    newUser.save(err=>{
        if(err){
            console.log(err);
        }else{
            // res.render("petition")
            res.redirect("/petition")
        }
    })
      });


})

app.post("/login",(req,res)=>{
    const userName =req.body.userName;
    const password =req.body.password;

    User.findOne({email:userName},(err,foundUser)=>{
        if(err){
            console.log(err)
        }else if(foundUser){
            bcrypt.compare(password, foundUser.password, function(err, result) {
               if(result === true){
                res.redirect("/petition");
               }else{
                  console.log("check your password")
               }
            })
        }
    })
})



app.listen(3000, (req,res)=>{
    console.log("the surver is running on the  3000 port.")
})
