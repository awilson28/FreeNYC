/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Thing = require('./thing.model');
var nodemailerConfig = require('../../config/nodemailer');
var User = require('../user/user.model');


// Get list of things
exports.index = function(req, res) {
  Thing.find(function (err, things) {
    if(err) { return handleError(res, err); }
    return res.json(200, things);
  });
};

// Get a single thing
exports.show = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    return res.json(thing);
  });
};

// Gets a user's received messages
exports.getMessages = function(req, res) {
  Thing.find({conversants : {$in: [req.user._id]}})
       .populate('conversants messages.sender', 'name')
       .exec(function (err, things) {
          if(err) { return handleError(res, err); }
          if(!things) { return res.send(404); }
          return res.json(things);
        });
};

// reply to a message
// exports.communicate = function(req, res) {
//   //req.params.id indicates the id of the person receiving the message
//   Thing.findByIdAndUpdate(req.params.id, {$push: {messages: req.body}}, function (err, things) {
//     if(err) { return handleError(res, err); }
//     if(!things) { return res.send(404); }
//     return res.json(things);
//   });
// };


exports.communicate = function(req, res) {
  //req.params.id indicates the id of the person receiving the message
  console.log('body', req.body)
  console.log('in here communicate')
  Thing.findByIdAndUpdate(req.params.id, {$push: {messages: req.body}}, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    thing.setNumMessages(req.body.recipient._id, true, function(thing){
      return res.json(thing);   
    })
  });
};

//decrement new message count
exports.adjustNumNewMessages = function(req, res) {
  //req.params.id indicates the id of the person receiving the message
  Thing.findById(req.params.talkId, function (err, thing) {
    thing.setNumMessages(req.user._id, false, function(thing){
      if(err) { return handleError(res, err); }
      if(!thing) { return res.send(404); }
      return res.json(thing);   
    })
  });
};



// Creates a new thing in the DB.
// exports.create = function(req, res) {
//   req.body.sender = req.user._id;
//   Thing.create({messages: [req.body], conversants: [req.body.recipient, req.user._id]}, function(err, thing) {
//     if(err) { return handleError(res, err); }
//     return res.json(201, thing);
//   });
// };

// Creates a new thing in the DB.
exports.create = function(req, res) {
  req.body.sender = req.user._id;
  // console.log('REQBODY', req.body)
  User.findById(req.body.recipient, function(err, user){
    var options = {
        from: 'freestorenyc@gmail.com',
        to: user.email,
        subject: 'some has bid on your item.',
        text: 'Check out your messages to learn more or email that person at ' + req.user.email + '.'
      }
    nodemailerConfig.transporter.sendMail(options, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    nodemailerConfig.transporter.close();
    }); 
  })
  Thing.create({messages: [req.body], conversants: [req.body.recipient, req.user._id]}, function(err, thing) {
    thing.setNumMessages(req.body.recipient, true, function(thing){
      if(err) { return handleError(res, err); }
      return res.json(201, thing);
    });    
  })
};

// Updates an existing thing in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Thing.findById(req.params.id, function (err, thing) {
    if (err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    var updated = _.merge(thing, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, thing);
    });
  });
};

// Deletes a thing from the DB.
exports.destroy = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    thing.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}