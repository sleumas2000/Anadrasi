(function(){
  'use strict';
  angular.module('anadrasi')
    .controller('menuEditorController', function($scope, Menu){
      $scope.currentDay = {}
      Menu.whatWeek({day:(new Date()).toISOString()}).$promise.then(function(week){
        var currentDay = $scope.currentDay
        currentDay.week = week.week
        currentDay.day = (new Date()).getDay()
        currentDay.dayString = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][currentDay.day]
        $scope.currentDay = currentDay
        $scope.$watch($scope.currentDay,getMenu)
      })
      function getMenu() {
        Menu.getDay({week: $scope.currentDay ? $scope.currentDay.week ? $scope.currentDay.week.toString() : " " : " ", day: $scope.currentDay ? $scope.currentDay.day ? $scope.currentDay.day.toString() : " " : " "}).$promise.then(function(menu){
          $scope.currentDay.menu = menu
          $scope.editedMenu = menu
        })
      }
      $scope.addItem = function(item,meal) {
        if (item == 'main') {
          (function(meal) {
            if (!$scope.editedMenu[meal].main1) {
              $scope.editedMenu[meal].main1 = {name:'',title:'Main Meal 1',allergens:[],vegetarian:false}
            } else if (!$scope.editedMenu[meal].main2) {
              $scope.editedMenu[meal].main2 = {name:'',title:'Main Meal 2',allergens:[],vegetarian:false}
            } else if (!$scope.editedMenu[meal].main3) {
              $scope.editedMenu[meal].main3 = {name:'',title:'Main Meal 3',allergens:[],vegetarian:false}
            } else if (!$scope.editedMenu[meal].main4) {
              $scope.editedMenu[meal].main4 = {name:'',title:'Main Meal 4',allergens:[],vegetarian:false}
            } else if (!$scope.editedMenu[meal].main5) {
              $scope.editedMenu[meal].main5 = {name:'',title:'Main Meal 5',allergens:[],vegetarian:false}
            }
          })(meal)
        }
        if (item == 'veg') {
          (function(meal) {
            if (!$scope.editedMenu[meal].veg1) {
              $scope.editedMenu[meal].veg1 = {name:''}
            } else if (!$scope.editedMenu[meal].veg2) {
              $scope.editedMenu[meal].veg2 = {name:''}
            } else if (!$scope.editedMenu[meal].veg3) {
              $scope.editedMenu[meal].veg3 = {name:''}
            } else if (!$scope.editedMenu[meal].veg4) {
              $scope.editedMenu[meal].veg4 = {name:''}
            } else if (!$scope.editedMenu[meal].veg5) {
              $scope.editedMenu[meal].veg5 = {name:''}
            }
          })(meal)
        }
        if (item == 'item') {
          (function(meal) {
            if (!$scope.editedMenu[meal].item1) {
              $scope.editedMenu[meal].item1 = {name:''}
            } else if (!$scope.editedMenu[meal].item2) {
              $scope.editedMenu[meal].item2 = {name:''}
            } else if (!$scope.editedMenu[meal].item3) {
              $scope.editedMenu[meal].item3 = {name:''}
            } else if (!$scope.editedMenu[meal].item4) {
              $scope.editedMenu[meal].item4 = {name:''}
            } else if (!$scope.editedMenu[meal].item5) {
              $scope.editedMenu[meal].item5 = {name:''}
            }
          })(meal)
        }
        if (item == 'dessert') {
          (function(meal) {
            if (!$scope.editedMenu[meal].dessert1) {
              $scope.editedMenu[meal].dessert1 = {name:''}
            } else if (!$scope.editedMenu[meal].dessert2) {
              $scope.editedMenu[meal].dessert2 = {name:''}
            } else if (!$scope.editedMenu[meal].dessert3) {
              $scope.editedMenu[meal].dessert3 = {name:''}
            } else if (!$scope.editedMenu[meal].dessert4) {
              $scope.editedMenu[meal].dessert4 = {name:''}
            } else if (!$scope.editedMenu[meal].dessert5) {
              $scope.editedMenu[meal].dessert5 = {name:''}
            }
          })(meal)
        }
      }
    })
    .directive("menuEditorMeal", function() {
      return {
        restrict: 'E',
        scope: {
          meal: '@',
          editedMenu: '=editedMenu',
          addItem: '=addItem'
        },
        templateUrl: '/app/components/directives/menuEditorMeal.html'
      };
    })
    .directive("menuEditorMain", function() {
      return {
        restrict: 'E',
        scope: {
          item: '='
        },
        templateUrl: '/app/components/directives/menuEditorMain.html',
        controller: 'menuEditorSubController'
      };
    })
    .directive("menuEditorVeg", function() {
      return {
        restrict: 'E',
        scope: {
          item: '='
        },
        templateUrl: '/app/components/directives/menuEditorVeg.html',
        controller: 'menuEditorSubController'
      };
    })
    .directive("menuEditorItem", function() {
      return {
        restrict: 'E',
        scope: {
          item: '='
        },
        templateUrl: '/app/components/directives/menuEditorItem.html',
        controller: 'menuEditorSubController'
      };
    })
    .directive("menuEditorDessert", function() {
      return {
        restrict: 'E',
        scope: {
          item: '='
        },
        templateUrl: '/app/components/directives/menuEditorDessert.html',
        controller: 'menuEditorSubController'
      };
    })
    .controller('menuEditorSubController', function($scope){
      $scope.$watch("item",function(){
        if ($scope.item) {
          var allergenIsSelected = {}
          for (var i in $scope.item.allergens) {
            allergenIsSelected[$scope.item.allergens[i]] = true
          }
          $scope.allergenIsSelected = allergenIsSelected
        }
      })
      $scope.allAllergensList = ['G','W','Seafood','E','F','P','S','D','N','C','M','SE','S/D','L','MOL']
      $scope.updateAllergens = function(){
        if ($scope.item) {
          var allergens = []
          for (var a in $scope.allAllergensList) {
            if ($scope.allergenIsSelected[$scope.allAllergensList[a]]) {
              allergens.push($scope.allAllergensList[a])
            }
          }
          $scope.item.allergens = allergens
        }
      }
      $scope.removeSelf = function(){
        delete $scope.item
      }
    })
})();
