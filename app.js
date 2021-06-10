require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport =require("passport");
const session=require("express-session");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy=require("passport-google-oauth20").Strategy;
const findOrCreate= require("mongoose-findorcreate");
const bcrypt= require("bcrypt");
const _ = require('lodash');
const saltRounds =10;


const app = express();
app.use(express.static("public"));
app.set("view engine",'ejs');
app.use(bodyParser.urlencoded({extended:true}));

// import the module 
const User = require("./models/user");
const Petition = require("./models/petition");

const { insertMany } = require('./models/user');


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true,useUnifiedTopology: true});

app.use(session({
    secret:"our little secret",
    resave:false,
    saveUninitialized:false
}))


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


const petitionItems = [ ];

Petition.insertMany(petitionItems,(err)=>{
    if(err) {
        console.log(err);
    }else{
        console.log("successfully saved your data! ");
    }
})

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
    Petition.find({}, (err, foundItems)=>{
        res.render("petitionlist",{
         petitions: foundItems
        });
    })
})


app.get("/post/:postId",(req,res)=>{
   const requestedPetition= req.params.postId;
 
   Petition.findOne({_id:requestedPetition},(err,foundItems)=>{
       if(!err){
           if(!foundItems){
               console.log("does not matched.")
           }else{
           
               res.render("post",{
                Title: foundItems.Title,
               TagedAuthority: foundItems.TagedAuthority,
              Description: foundItems.Description
               })
           }
       }
   })

});
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
 
     const Title = req.body.Title;
     const  TagedAuthority= req.body.TagedAuthority;
     const  Description= req.body.Description;
  
const petition = new Petition({
    Title:Title,
    TagedAuthority:TagedAuthority,
    Description:Description
});
petition.save();
res.redirect("/petitionlist");
})

app.post("petitionlist",(req,res)=>{
    res.render("petitionlist")
})
app.listen(3000, (req,res)=>{
    console.log("the surver is running on the  3000 port.")
})
