(function(){
  'use strict';

  angular
    .module('anadrasi')
    .config(function($httpProvider, $stateProvider, $urlRouterProvider, $locationProvider){
      $urlRouterProvider.otherwise('/rate');
      $stateProvider
        .state('rate', {
          url: '/rate',
          views: {
            'content@': {
              templateUrl: '/app/components/rate.html',
              controller: 'rateController'
            }
          }
        })
        .state('viewRatings', {
          url: '/view-ratings',
          views: {
            'content@': {
              templateUrl: '/app/components/viewRatings.html',
              controller: 'viewRatingsController'
            }
          }
        })
        .state('menu', {
          url: '/menu',
          views: {
            'content@': {
              templateUrl: '/app/components/menu.html',
              controller: 'menuController'
            }
          }
        });
      if(window.history && window.history.pushState){
        $locationProvider.html5Mode({
          enabled: true,
          requireBase: false
        })
      }
    })
})();
