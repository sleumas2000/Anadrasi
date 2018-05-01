(function(){
  'use strict';
  angular.module('anadrasi')
    .controller('menuController', function($scope, $state, $q, Menu){
      $q.all([Menu.getToday().$promise,Menu.getCurrentService().$promise]).then(function([menu,meal]){
        $scope.menu = menu
        console.log($scope.menu)
        $scope.day = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][$scope.menu.day]
        $scope.week = $scope.menu.week
        $scope.lunch = menu.lunch
        $scope.supper = menu.supper
        $scope.meal = meal.meal
        if ($scope.meal == "outOfHours") { // Temporarily show supper menu overnight
          $scope.meal = "supper"
        }
        $scope.goToRate = function() {
          $state.go('rate')
        }
      })
      $scope.goToRate = function() {
        $state.go('rate')
      }
    })
    .directive("mainMeal", function() {
      return {
        restrict: 'E',
        scope: {
          meal: '=',
          item: '@'
        },
        templateUrl:'/app/components/directives/mainMeal.html',
      };
    })
    .directive("veg", function() {
      return {
        restrict: 'E',
        scope: {
          meal: '=',
          item: '@'
        },
        templateUrl:'/app/components/directives/veg.html',
      };
    });
})();
