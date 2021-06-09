require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport =require("passport");
const session=require("express-session");
const passportLocalMongoose=require("passport-local-mongoose")
const GoogleStrategy=require("passport-google-oauth20").Strategy;
const findOrCreate= require("mongoose-findorcreate");
// const encrypt = require("mongoose-encryption");
// const md5 =require("md5");
const bcrypt= require("bcrypt");
const _ = require('lodash');
const saltRounds =10;

const petitions=[];
const app = express();
app.use(express.static("public"));
app.set("view engine",'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret:"our little secret",
    resave:false,
    saveUninitialized:false
}))
// connect to mongoose with mmongodb 
// mongoose.connect('mongodb://localhost:27017/PetitionListDB', {useNewUrlParser: true, useUnifiedTopology: true});
// const petitionSchema = new mongoose.Schema({
//     Title: String,
//     TagedAuthority : String,
//     Descrition: String
// })

// const Petition = mongoose.model("Petition", petitionSchema);


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true,useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
   email: String,
   password: String
});
userSchema.plugin(findOrCreate);


const User = mongoose.model("User",userSchema);

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://www.example.com/auth/google/petition",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
// userSchema.plugin(encrypt,{secret: process.env.SECRET, encryptedFields:['password']});



app.get('/',(req,res)=>{
    res.render("home",{})
})
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] }));

app.get('/login',(req,res)=>{
    res.render("login",{})
})
app.get('/register',(req,res)=>{
    res.render("register",{})
})
app.get('/petition',(req,res)=>{
   res.render("petition")

})
app.get('/petitionlist',(req,res)=>{
res.render("petitionlist",{
    petitions:petitions
});
// console.log(petitions);

})


app.get("/post/:postTitle",(req,res)=>{
   const requestedPetition= _.lowerCase(req.params.postTitle);
petitions.forEach((post)=>{
    const storedPetition = _.lowerCase(post.Title);

if( requestedPetition==storedPetition){
res.render("post",{
   Title : post.Title,
   TagedAuthority : post.TagedAuthority,
   Description: post.Description
})
}

})

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

app.post("/petition",(req,res)=>{
  const petition={
        Title:req.body.Title,
        TagedAuthority:req.body.TagedAuthority,
        Description:req.body.Description
  }
  petitions.push(petition);

res.redirect("/petitionlist");
})

app.post("petitionlist",(req,res)=>{
    res.render("petitionlist")
})
app.listen(3000, (req,res)=>{
    console.log("the surver is running on the  3000 port.")
})
