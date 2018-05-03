(function(){
  'use strict';
  angular.module('anadrasi')
    .controller('viewRatingsController', function($scope, $timeout, Menu, Rating, Feedback, Config){
      $scope.getRatings = function(timeframe){
        $scope.timeframe = timeframe
        Rating.daysAgoSummary({daysAgo:timeframe}).$promise.then(function (ratings) {
          $scope.ratings = ratings
          $scope.data = []
          console.log(ratings)
          for (var date in ratings){
            if (date[0]=="$" || date == "toJSON") {
              continue
            }
            var meals = []
            for (var meal in ratings[date]) {
              meals.push({meal:meal,totals:ratings[date][meal]})
            }
            meals.sort(function(a,b){
              return ['breakfast','lunch','supper','outOfHours'].indexOf(a.meal) - ['breakfast','lunch','supper','outOfHours'].indexOf(b.meal)
            })
            $scope.data.push({date:date,meals:meals})
          }
        })
      }
      $scope.getDayInfo = function(day){
        Menu.whatWeek({day:day.date}).$promise.then(function(week){
          day.week = week.week
        })
        Menu.getDate({date:day.date}).$promise.then(function(menu){
          day.menu = menu
        })
        day.day = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][(new Date(day.date)).getDay()]
      }
      $scope.getRatings("=0")
      $scope.stringifyDate = function(date){
        var d = new Date(date)
        return d.toLocaleDateString("en-GB")
      }
    })
    .directive("ratingSummary", function() {
      return {
        restrict: 'E',
        scope: {
          date: '<',
          meal: '<',
          summary: '<',
          menu: '<'
        },
        templateUrl:'/app/components/directives/ratingSummary.html',
        controller: 'graphController'
      };
    })
    .controller('graphController', function($scope){
      $scope.scale = function(value,data){
        var max = Object.values(data).reduce((a, b) => a > b ? a : b)
        return 100*value/max
      }
      $scope.getGraphClasses = function(score) {
        var classes = {rating: true, graph: true, bar: true}
        classes['score-'+score] = true
        return classes
      }
      $scope.prettify = function(meal){
        return {breakfast:'Breakfast',lunch:'Lunch',supper:'Supper',outOfHours:'Overnight'}[meal]
      }
    });
})();
