const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Creating a schema - this will be like a blue print
const userSchema = new Schema({
  name:{type: String, required: true},
  emailId:{type: String, required: true},
  password:{type: String, required: true}
});

// Creating user model
const User = mongoose.model('user', userSchema);

module.exports = User;
