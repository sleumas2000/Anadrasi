(function(){
  'use strict';
  angular.module('anadrasi')
    .controller('viewRatingsController', function($scope, $timeout, Idle, Keepalive, $state, Rating, Feedback, Config){
      $scope.getRatings = function(timeframe){
        $scope.timeframe = timeframe
        Rating.daysAgo({daysAgo:timeframe}).$promise.then(function (ratings) {
          $scope.ratings = ratings
        })
      }
      $scope.getRatings("=0")

    })
})();
