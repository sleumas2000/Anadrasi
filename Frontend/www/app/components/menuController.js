(function(){
  'use strict';
  angular.module('anadrasi')
    .controller('menuController', function($scope, $state, Menu){
      Menu.getToday().$promise.then(function(values){
        $scope.menu = values
        console.log($scope.menu)
        $scope.day = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][$scope.menu.Day]
        console.log($scope.day)
      })
      $scope.goToRate = function() {
        $state.go('rate')
      }
    })
})();
