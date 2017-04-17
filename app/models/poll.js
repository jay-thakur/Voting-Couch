const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Creating poll schema
const pollSchema = mongoose.Schema({
  pollName: {type: String, unique: true, required: true},
  options: [
    {
      name: {type: String, required: true},
      voteCount: {type: Number, default: 0}
    }
  ],
  createdBy: String,
  createdDate: {type: Date, default: Date.now()}
});

// Creating a poll model
const Poll = mongoose.model('poll', pollSchema);

module.exports = Poll;
