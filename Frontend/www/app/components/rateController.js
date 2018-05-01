(function(){
  'use strict';
  angular.module('anadrasi')
    .controller('rateController', function($scope, $timeout, Idle, Keepalive, $state, Rating, Feedback){
      function showThankYou() {
        $scope.showThankYou = true;
        $timeout(function() {$scope.showThankYou = false;}, 1500)
      }
      $scope.rate = function(score) {
        Rating.rate({rating:score})
        showThankYou()
      }
      $scope.feedback = function() {
        var userFeedback = new Feedback()
        userFeedback.comment = $scope.userFeedback
        Feedback.save(userFeedback, function(){
          $scope.userFeedback = ""
          showThankYou()
        })
      }

      // Go to menu on idle
      $scope.$on('IdleStart', function() {
        $state.go('menu')
      });
      Idle.watch()
    })
    .config(function(IdleProvider, KeepaliveProvider) {
      IdleProvider.idle(20);
      IdleProvider.timeout(0);
      KeepaliveProvider.interval(10);
    })
})();
