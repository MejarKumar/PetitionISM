const mongoose =require('mongoose');
// mongoose.connect("mongodb://localhost:27017/PetitionDB",{useNewUrlParser:true,useUnifiedTopology: true});

const petitionSchema = new mongoose.Schema({
  Title : String,
  TagedAuthority : String,
  Description : String,
 });

 
 module.exports = mongoose.model("Petition",petitionSchema);