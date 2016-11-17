/**
 * Created by Paulien on 28-4-2016.
 */
'use strict';
angular.module('frontendApp')
  .controller('ResultsController', ['$scope', 'apiGet', 'API_URL', 'resultsService', '$window', '$location', '$filter', function ($scope, apiGet, API_URL, resultsService, $window, $location, $filter) {
    // Page constants
    $scope.pageTitle = 'Resultaten';
    $scope.amount = 'Aantal';
    $scope.responseTime = 'Responsetime';
    $scope.errorMarge = 'Foutmarge';
    $scope.throughput = 'Throughput';
    $scope.rps = 'rps';
    $scope.ms = 'ms';

    // Gauge variables
    $scope.max = 500;
    $scope.offset = 0;
    $scope.stroke = 40; // 100 is full
    $scope.radius = 100;
    $scope.isSemi = true;
    $scope.rounded = false;
    $scope.responsive = true;
    $scope.duration = 0;
    $scope.currentAnimation = 'easeOutCubic'; // http://crisbeto.github.io/angular-svg-round-progressbar/
    $scope.animationDelay = 0;
    $scope.fillColor = '#e53935'; // red darken-1
    $scope.bgColor = '#eaeaea'; // light grey

    // Page vars
    $scope.testStarted = false;

    $scope.clusters = [];
    $scope.tests = [];

    apiGet().getClusters().then(function onSuccess(response) {
      if (response.status == 200) {
        $scope.clusters = response.data;
      }
    });

    apiGet().getTests().then(function onSuccess(response) {
      if (response.status == 200) {
        $scope.tests = response.data;
      }
    });

    /* Observer impl */
    var id = 1;
    var idConnect = id + 1;
    var idClear = idConnect + 1;
    var topicUpdate = 'results:update';
    var topicConnect = 'results:reconnect';
    var topicClear = 'results:clear';

    function callbackUpdate(current, newValue) {
      var shouldReload = ($location.path().indexOf('result') >= 0 && $scope.testStarted && $scope.svc.state.length !== current.length);
      if (shouldReload) {
        $window.location.reload();
      }
      digestScope(current, newValue);
    }

    function digestScope(current, newValue) {
      $scope.$apply();
      $scope.$digest();
    }

    function clearScope(current, newValue) {
      //digestScope(current);
      // results were cleared check if test is active.
      testActive();

      if ($scope.svc.state.length > current.length) {
        $window.location.reload(true);
        $location.path('/results');
      }
      digestScope(current);
    }

    $scope.$on('$destroy', function handler() {
      resultsService.detach(id, topicUpdate);
      resultsService.detach(idConnect, topicConnect);
      resultsService.detach(idClear, topicClear);
    });
    /**********************/

    // init service & variables
    $scope.svc = resultsService;
    $scope.results = $scope.svc.state;
    $scope.socket = $scope.svc.socket;

    //attach observers to service
    $scope.svc.attach(id, topicUpdate, callbackUpdate);
    $scope.svc.attach(idConnect, topicConnect, digestScope);
    $scope.svc.attach(idClear, topicClear, clearScope);

    // Get initial data
    var testActive = function testActive() {
      apiGet().getActive()
        .then(function onSuccess(response) {
          if (response.status === 200) { // HttpStatus 200 OK
            var json = response.data;
            if (('loadtest' in json || 'chaos monkey' in json || 'rolling updates') && 'clusters' in json) {
              $scope.testStarted = true;
            }
          } else {
            $scope.testStarted = false;
          }
        }, function onError(response) {
          $scope.testStarted = false;
        });
    };
    testActive(); // first check if test is active

    $scope.showLoading = function () {
      return ($scope.socket.connecting || $scope.svc.state.length <= 0) && $scope.testStarted;
    };

    $scope.showMessage = function () {
      return $scope.svc.state.length <= 0 && !$scope.testStarted;
    };

    $scope.getMessage = function () {
      return !$scope.testStarted ? "Test is niet gestart." : "Geen resultaten.";
    };

    $scope.getCluster = function (clusterId) {
      var found = $filter('getById')($scope.clusters, clusterId);
      if (found != null) {
        return found.object.name;
      }
      return clusterId; // could not find
    };

    $scope.getTest = function (testId) {
      var found = $filter('getById')($scope.tests, testId);
      if (found != null) {
        if (found.object.name.indexOf('test') < 0) return found.object.name + ' test';
        return found.object.name;
      }
      return testId; // could not find
    };

  }])
  .filter('percentage', ['$filter', function ($filter) {
    return function (input, decimals) {
      return $filter('number')(input, decimals) + '%';
    };
  }])
;
