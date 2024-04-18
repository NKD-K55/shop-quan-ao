// models/user.model.js
// load những thư viện chúng ta cần
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// định nghĩ cấu trúc user model
var Schema = mongoose.Schema;
var schema = new Schema({
  
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    role: {type: String, required: true, default: "user"},
    lock 		: {type: Number, required: false, default: 0}, 
    facebook: {type: JSON, default: "null"}
});
schema.methods.encryptPassword= function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5),null);
};
schema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('User', schema);