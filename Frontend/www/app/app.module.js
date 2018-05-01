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
         }
       });
    })
    .factory('Feedback', function($resource){
       return $resource(apiRoot+"/feedback", {}, {});
    })
    .factory('Menu', function($resource){
       return $resource(apiRoot+"/menu", {rating: '@rating', daysAgo: '@daysAgo'}, {
         getToday: {
           url: apiRoot+"/menu/today",
           method: 'GET',
         },
         getCurrentService: {
           url: apiRoot+"/currentService",
           method: 'GET'
         }
       });
    });
})();
