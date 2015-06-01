'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User = require('../user/user.model'),
    textSearch = require('mongoose-text-search'),
    nodemailerConfig = require('../../config/nodemailer'),
    async = require('async');


var PostSchema = new Schema({
  postTitle: String,
  crossStreets: String,
  description: String,
  postType: String, 
  itemType: String, 
  keyWords: [String], 
  taken: Boolean,
  fulfilled: Boolean,
  dimensions: String,
  numBids: Number,
  coordinates: [Number, Number],
  img: Array,
  ratingsEnabled: Boolean,
  //the only one-to-many relationship on the schema... potentially (with wishlist capability)
  //a one-to-squillions relationship
  bids: [{type: Schema.Types.ObjectId, ref: 'User'}], 
  date: {type: Date, default: Date.now},
  //this is a one-to-one relationship. 
  inTransactionWith: [{type: Schema.Types.ObjectId, ref: 'User'}],
  user: {type: Schema.Types.ObjectId, ref: 'User'}
});

// PostSchema.plugin(textSearch);


//set number of bids as a function of bids array
PostSchema.methods = {
  setBids: function(id, callback){
    if (this.bids.indexOf(id) === -1){
      console.log('populating bids array')
      this.bids.push(id)
      this.numBids = this.bids.length; 
      this.save()
      callback(this); 
    }
  }, 
  findRelevantUsers: function(callback){
    var self = this;
    var matchArr = [].concat(self.keyWords).concat(self.postTitle.split(' '));
    console.log('MATCH ARRAY', matchArr);
    User.find({$or: [{'wishList.itemName': {$in: matchArr}}, {'wishList.keywords': {$in: matchArr}}]}, function(err, users){
      callback(users, self)
    })
    // User.matchUserWishlist(matchArr, function(err, users){
    //   console.log('MATCHEEDDDDDD', users, 'ERRORS', err);
    //   callback(users, self);
    // });
  }, 
  abortTransaction: function(id, callback){
    console.log('id', id)
    console.log('bids before', this.bids)
    var index = this.bids.indexOf(id)
    console.log('index', index)
    this.bids.splice(index, 1)
    console.log('bids', this.bids)
    this.inTransactionWith = []; 
    this.save()
    callback(this);
  }
}

PostSchema.post('save', function(users){
  this.findRelevantUsers(function(users, self){
    async.each(users, function(user, done){
      if (user.alerts.indexOf(self._id) === -1) {
        user.alerts.push(self._id)
        user.save(function(err, userLater, numModified) {
          var options = {
            from: 'freestorenyc@gmail.com',
            to: user.email,
            subject: 'An item matches your wishlist.',
            text: 'Check out your alerts to bid.'
          }
          console.log('nodemailerConfig', options)
          nodemailerConfig.transporter.sendMail(options, function(error, info){
              if(error){
                  console.log(error);
              }else{
                  console.log('Message sent: ' + info.response);
              }
          nodemailerConfig.transporter.close();
          done(null)    
          });
        }); 
      } else {
        console.log('in else')
        done(null) 
      }
    })
  })
})

PostSchema.index({ postTitle: 'text', keyWords: 'text', description: 'text'}, {weights: {postTitle: 1, keyWords: 1, description: 1} });

module.exports = mongoose.model('Post', PostSchema);