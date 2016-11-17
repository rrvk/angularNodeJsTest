/**
 * Created by Paulien on 22-4-2016.
 */
'use strict';
angular.module('frontendApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {redirectTo: '/tests'})
      .when('/tests', {
        templateUrl: 'views/tests.html',
        controller: 'TestsController'
      })
      .when('/results', {
        templateUrl: 'views/results.html',
        controller: 'ResultsController'
      })
      .when('/admin', {
        templateUrl: 'views/clusters.html', // TODO make admin page
        controller: 'ClustersController'
      })
      .otherwise({redirectTo: '/tests'});


  });
