const mongoose =require('mongoose');
const findOrCreate= require("mongoose-findorcreate");
const passportLocalMongoose=require("passport-local-mongoose");



const userSchema = new mongoose.Schema({
    // username: String,
    email: String,
    password: String
 });
 userSchema.plugin(findOrCreate);

 module.exports = mongoose.model("User",userSchema);
