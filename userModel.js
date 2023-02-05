const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {type:String,require:true},
    email : {type:String,require:true,unique:true},
    password:{type:String,require:true},
    disease : {type:String,require:true},
    allergies:{type:String,require:true,default:"None"},
    medicines:{type:String,require:true,default:"None"}
});

const User = mongoose.model('User',userSchema);

module.exports =  User;