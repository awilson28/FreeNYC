'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/getWishes/', auth.isAuthenticated(), controller.getWishes);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/updateWishlist/:id', auth.isAuthenticated(), controller.wishList);
router.put('/changeWish/:index/', auth.isAuthenticated(), controller.changeWish);
router.post('/', controller.create);
router.post('/wish/', auth.isAuthenticated(), controller.addWish);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);

module.exports = router;
