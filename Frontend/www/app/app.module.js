(function(){
  'use strict';
  var params = params = new URLSearchParams(document.location.search.substring(1));
  const apiRoot= (params.get("ip") || "//localhost")+":6225/api/v1";

  angular
    .module('anadrasi', [
      'ui.router',
      'ngResource',
      'ui.bootstrap',
      'ngAnimate',
      'ngIdle'
    ])
    .factory('Rating', function($resource){
       return $resource(apiRoot+"/ratings/all", {rating: '@rating', daysAgo: '@daysAgo'}, {
         rate: {
           url: apiRoot+"/rate/:rating",
           method: 'POST',
         },
         today: {
            url: apiRoot+"/ratings/today",
            method: 'GET',
            isArray: true,
         },
         daysAgo: {
            url: apiRoot+"/ratings/daysAgo/:daysAgo",
            method: 'GET',
            isArray: true,
         },
         todaySummary: {
            url: apiRoot+"/ratings/today/summary",
            method: 'GET',
         },
         daysAgoSummary: {
            url: apiRoot+"/ratings/daysAgo/:daysAgo/summary",
            method: 'GET',
         }
       });
    })
    .factory('Feedback', function($resource){
       return $resource(apiRoot+"/feedback", {}, {});
    })
    .factory('Menu', function($resource){
       return $resource(apiRoot+"/menu", {day: '@day',date: '@date'}, {
         getToday: {
           url: apiRoot+"/menu/today",
           method: 'GET',
         },
         getDate: {
           url: apiRoot+"/menu/onDate/:date",
           method: 'GET',
         },
         whatWeek: {
           url: apiRoot+"/menu/whatWeek/:day",
           method: 'GET'
         }
       });
    })
    .factory('Config', function($resource){
       return $resource(apiRoot+"/menu", {}, {
         currentService: {
           url: apiRoot+"/currentService",
           method: 'GET'
         },
         showCommentBox: {
           url: apiRoot+"/config/showCommentBox",
           method: 'GET'
         }
       });
    });
})();
