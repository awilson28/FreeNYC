'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];
var async = require('async');


var UserSchema = new Schema({
  name: String,
  email: { type: String, lowercase: true },
  role: {
    type: String,
    default: 'user'
  },
  location: String,
  bookmarkedItems: Array,
  wishList: Array,
  ratingArray: Array,
  rating: {type: Number, default: 5},
  //a one to many relationship - this is the display for posts you've bid on
  currentTransactions: [{type: Schema.Types.ObjectId, ref: 'Post'}],
  //a one to squillions relationship (potentially... should add functionality so that messages
    //older than 10 days are deleted to keep it at one to many relationship
  messsages: [{type: Schema.Types.ObjectId, ref: 'Thing'}],
  //a one to many relationship. also need self-deleting capability 
  alerts: [{type: Schema.Types.ObjectId, ref: 'Post'}],
  numMessages: {type: Number, default: 0},
  hashedPassword: String,
  provider: String,
  salt: String,
  facebook: {},
  twitter: {},
  google: {},
  github: {}
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }, 

  changeWishList: function(index, item, callback){
      // this.wishList[index] = item;
      this.wishList.set(index, item);
      this.save(function(err, newlyUpdated, numModified) {
        // console.log("modified: ", numModified);
        // console.log("this is newly updated", newlyUpdated);
        callback(newlyUpdated)
      })
  },

  computeRating: function(callback) {
    var sum = 0;
    for (var i=0; i<this.ratingArray.length; i++){
      sum+=this.ratingArray[i];
    }
    this.rating = sum/this.ratingArray.length;
    this.save();
    console.log('RATING', this.rating);
    callback(this);
  }


};

// UserSchema.statics = {
//   matchUserWishlist: function(array, callback) {
//     this.find({}, function(err, users){
//       async.each(users, function(err, user){
//         // console.log('Allusers', users)
//         async.each(user.wishList, function(err, wish){
//           console.log('wishlist', user.wishList, 'wish', wish)
//           for (var key in wish){

//             if (Array.isArray(wish[key])){
//               var arr = wish[key]
//               async.each(arr, function(item){
//                 if (array.indexOf(item) !== -1){
//                   //execute match
//                   callback(user)
//                 }
//               }, function(err){
//                 console.log('errors inner', err);
//               })
//             }
//             else if (array.indexOf(wish[key]) !== -1){
//               callback(user)
//             }
            
//           }
        
//         }, function(err){
//           console.log('errors', err);
//         })
//       }, function(err){
//         console.log('errors2', err);
//       })

//     })
//   }
// }

// UserSchema.statics = {
//   matchUserWishlist: function(array, callback) {
//     this.find({}, function(err, users){
//       console.log('USER TOTAL', users.length);
//       users.forEach(function(user){
//         user.wishList.forEach(function(wish){
//           console.log('wishlist', user.wishList, 'wish', wish)
//           for (var key in wish){
//             if (Array.isArray(wish[key])){
//               var arr = wish[key]
//               console.log('arr in wishlist', arr)
//               arr.forEach(function(item){
//                 if (array.indexOf(item) !== -1){
//                   console.log('matched item', item)
//                   callback(err, user)
//                 }
//               })
//             }
//             else if (array.indexOf(wish[key]) !== -1){
//               console.log('matched item', wish[key])
//               callback(err, user)
//             }
//           }
//         })
//       })
//     })
//   }
// }

module.exports = mongoose.model('User', UserSchema);
