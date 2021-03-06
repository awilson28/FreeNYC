'use strict';

angular.module('freeNycApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',  
  'ui.utils'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
     .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl', 
        authenticate: false
      })
      .state('allItems', {
        url: '/home', 
        templateUrl: 'app/allItems/allItems.html', 
        controller: 'AllitemsCtrl as items', 
        authenticate: true

      })
      .state('singlePost', {
        url: '/singlePost/:id',
        templateUrl: 'app/allItems/singlePostView.html',
        controller: 'singlePostController as single', 
        authenticate: true

      })
      .state('postItem', {
        url: '/post_an_item',
        templateUrl: 'app/postItem/postItem.html', 
        controller: 'PostitemCtrl as postItem',
        authenticate: true
      })
      .state('userHome', {
        url: '/userHome',
        templateUrl: 'app/userHome/userHome.html',
        controller: 'UserhomeCtrl as user', 
        authenticate: true

      })
      .state('userHome.currentOffers', {
        url: '/currentOffers',
        templateUrl: 'app/userHome/userCurrentOffers/userCurrentOffers.html',
        controller: 'UsercurrentoffersCtrl as userOffers'
      })
      .state('userHome.currentWanteds', {
        url: '/currentWanteds',
        templateUrl: 'app/userHome/userCurrentWanteds/userCurrentWanteds.html',
        controller: 'UsercurrentwantedsCtrl as userWanteds'
      })
      .state('userHome.pastOffers', {
        url: '/pastOffers',
        templateUrl: 'app/userHome/pastOffers.html',
        controller: 'UsercurrentoffersCtrl as userOffers'
      })
      .state('userHome.currentTransactions', {
        url: '/currentTransactions',
        templateUrl: 'app/userHome/currentTransactions.html',
        controller: 'UsercurrentwantedsCtrl as userWanteds'
      })
      .state('userHome.wishList', {
        url: '/wishList',
        templateUrl: 'app/userHome/wishList/wishList.html',
        controller: 'WishlistCtrl as wish'
      })
      .state('userHome.messages', {
        url: '/messages',
        templateUrl: 'app/userHome/messages/messages.html',
        controller: 'MessagesCtrl as messages'
      })
      .state('userHome.singleConversationView', {
        url: '/messages/conversation',
        templateUrl: 'app/userHome/messages/singleConversationView.html',
        controller: 'MessagesCtrl as messages'
      });


    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  })

  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .run(function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  })
  // .run(function(editableOptions){
  //   editableOptions.theme ='bs3';
  // });