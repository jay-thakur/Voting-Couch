const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const UserModel = require('./app/models/user.js');
const PollModel = require('./app/models/poll.js');

var dotenv = require('dotenv');
dotenv.load();
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

var port = process.env.PORT || 8080;
var db_url = process.env.MONGOLAB_URI;
mongoose.connect(db_url, function(err, db) {
    if (err) {
        console.log('Unable to connect to the server. Please start the server. Error:', err);
    } else {
        console.log('Connected to Server successfully!');
    }
});

app.get('/', function (req, res) {
  res.sendFile(__dirname+'/views/index.html');
});

app.get('/home', function (req, res) {
  res.sendFile(__dirname+'/views/home.html');
});

app.post('/home/signup', function (req, res) {
  UserModel(req.body).save(function(error, data){
      if (error) {
        throw error;
        console.error("User Data is not saved."+error);
      } else {
        console.log("User data saved successfully");
        req.session.name = req.body.name;
        req.session.emailId = req.body.emailId;
        console.log("User in session : "+req.session.name);
        console.log("user emaill id : "+req.session.emailId);
        //res.sendFile(__dirname+'/views/home.html');
        res.redirect('/home');
      }
    });
});

app.post('/home/login', function (req, res) {
  console.log("email id "+req.body.emailId);
  console.log("password id "+req.body.password);
  UserModel.findOne({emailId: req.body.emailId}, function(err, user){
    if (err) {
      throw error;
      console.error("User email id is not found."+err);
    } else {
      if (req.body.emailId == user.emailId && req.body.password == user.password) {
        console.log("Credential successfully matched");
        req.session.emailId = req.body.emailId;
        req.session.name = user.name;
        res.redirect('/home');
        //res.sendFile(__dirname+'/views/home.html');
      } else {
        throw error;
        console.log("Invalid Credential");
      }
    }
  });
});

app.get('/getName', function (req, res) {
  console.log("getName called : name is :"+req.session.name);
  res.send(req.session.name);
});

app.get('/logout', function (req, res) {
  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

app.post('/home/newPoll', function (req, res) {
  const keys = Object.keys(req.body);
  console.log(keys);
  const optionsArr = [];
  for (var i = 1; i < keys.length; i++) {
    optionsArr.push({name : req.body[keys[i]]});
    console.log(req.body[keys[i]]);
  }
  const newPoll = new PollModel({
    pollName: req.body.newPollTitle,
    options: optionsArr,
    createdBy: req.session.emailId
  });
  console.log(newPoll);
  PollModel(newPoll).save(function(error, data){
      if (error) {
        console.error("Poll data is not saved."+error);
      } else {
        console.log("Poll data saved successfully");
        res.send(data);
      }
    });
});

app.get('/home/myPolls', function (req, res) {
  console.log("myPolls called");
  console.log("myPolls : user in session : "+req.session.emailId);
  PollModel.find({ createdBy: req.session.emailId}, function(err, data){
    if (err) {
      return console.error(err);
    }
    res.send(data);
  }).sort( { createdDate: -1 } );
});

app.get('/getlatestPolls', function (req, res) {
  console.log("getlatestPolls called");
  PollModel.find(function(err, data){
    if (err) {
      return console.error(err);
    }
    // console.log(data);
    res.send(data);
  }).sort( { createdDate: -1 } );
});

app.get('/poll/:id', function (req, res) {
  console.log(req.params.id);
  req.session.pollId = req.params.id;
  console.log("session : display poll of id : "+req.session.pollId);
  res.sendFile(__dirname+'/views/polls.html');
});

app.post('/updateVote', function(req, res){
  PollModel.findOneAndUpdate({"_id":req.session.pollId, "options.name": req.body.votedFor}, {$inc:{"options.$.voteCount":1} }, {new: true}, function(err, doc){
  	if(err){
  		console.log("Something wrong when updating data! "+err);
  	}
  	//console.log(doc);
    res.send(doc);
  });
})

app.get('/getPollId', function (req, res) {
  res.send(req.session.pollId);
});

app.get('/getPollDetails', function (req, res) {
  const id = req.session.pollId;
  PollModel.findById(id, function (err, data) {
     if (err) {
       console.log("could not find poll details by this id");
     } else {
       console.log("poll details : "+data);
       res.send(data);
     }
  });
});

app.get('/home/myPolls', function (req, res) {
  res.sendFile(__dirname+'/views/myPolls.html');
});

app.listen(port, function () {
  console.log(".... is listening to "+port);
})
