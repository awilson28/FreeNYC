'use strict';

angular.module('freeNycApp')
  .factory('wishList', function ($http) {

      function wishList(){

        var self = this; 

        this.postWishToDb = function(data, callback){
          $http.put('api/users', data).success(callback)
        }

        this.getWishes = function(callback){
          $http.get('api/users/getWishes/')
        }

        this.deleteWish = function(id, item, callback){
          console.log('in here')
          $http.put('api/users/updateWishList/' + id, item).success(callback)
        }

      }

      return new wishList()
  });