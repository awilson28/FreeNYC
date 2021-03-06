'use strict';

angular.module('freeNycApp')
  .factory('postService', function ($http) {
    
    function makePost(){


      this.addToDatabase = function(data, callback){
        $http.post('/api/posts', data).success(callback);
      }

      this.getData = function(callback, paginationData){
        // paginationData = paginationData || {skip: 0}
        // {params: paginationData}
        $http.get('/api/posts').success(callback);
      }

      this.filterData = function(keyword, callback){
        $http.get('/api/posts/' + keyword).success(callback);
      }

      this.deletePost = function(id, callback){
        $http.delete('/api/posts/' + id).success(callback);
      }

      this.updatePost = function(id, data, callback) {
        $http.put('/api/posts/'+id, data).success(callback);
      }

      this.populatePost = function(id, callback){
        $http.put('/api/posts/populateBid/'+ id).success(callback);
      }

      this.getUserBids = function(callback){
        $http.get('/api/posts/getBids/').success(callback);
      }

      this.getSinglePost = function(id, callback) {
        console.log(id);
        $http.get('/api/posts/single/'+id).success(callback);
      }

      this.enableRatings = function(id, obj, callback){
        $http.put('/api/posts/enableRatings/' + id + "/", obj).success(callback)
      }

      this.abortTransaction = function(postId, obj, callback){
        $http.put('/api/posts/abortTransaction/' + postId + '/', obj).success(callback)
      }

      this.retrieveBidsPost = function(id, callback){
         $http.put('/api/posts/getPostBids/'+ id + "/").success(callback);
      }
    }

    return new makePost();
  })
