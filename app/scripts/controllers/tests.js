/**
 * Created by Paulien on 21-4-2016.
 */
'use strict';

angular.module('frontendApp')
  .controller('TestsController', ['$scope', '$filter', 'apiGet', 'apiPost', 'resultsService', '$location', function ($scope, $filter, apiGet, apiPost, resultsService, $location) {
    //init
    var started = false;
    $scope.clusters = [];
    $scope.availableTests = [];
    $scope.rollingtest = [];
    $scope.config = {};
    $scope.config.clusters = [];
    $scope.config.loadtest = [];
    $scope.config.rollingtest = [];

    // page constants
    $scope.pageTitle = 'Tests configureren';
    $scope.clusterTitle = 'Clusters';
    $scope.loadtestTitle = 'Loadtests';
    $scope.rollingUpdateTitle = 'Rolling update';
    $scope.rollingUpdateInfo = 'Updates per hour';
    $scope.chaosMonkeyTitle = 'Chaos monkey';
    $scope.rps = 'rps';
    $scope.uph = 'uph';
    $scope.rpsInfo = 'Requests per seconde';
    $scope.buttonText = 'Start';

    /* TODO chaos monkey */

    $scope.hasContent = false;
    $scope.loaded = false;
    $scope.loadedClusters = false;
    $scope.loadedTests = false
    $scope.noContentMessage = 'Geen connectie met de server.';

    var setLoaded = function () {
      $scope.loaded = true;
    };

    apiGet().getClusters()
      .then(function mySuccess(response) {
        $scope.clusters = response.data;
        $scope.hasContent = true;
        $scope.loadedClusters = true;
      }, function onError(response) {
        console.log(response);
        $scope.clusters = response.statusText;
        $scope.hasContent = false;
      });

    apiGet().getTests()
      .then(function mySuccess(response) {
        $scope.availableTests = response.data;
        $scope.hasContent = true;
        $scope.loadedTests = true;
      }, function myError(response) {
        console.log(response);
        $scope.availableTests = response.statusText;
        $scope.hasContent = false;
      });

    $scope.$watchGroup(['loadedClusters', 'loadedTests'], function () {
      if ($scope.loadedClusters && $scope.loadedTests) {
        setLoaded();
      }
    });


    // Make sure only to get active when page is loaded
    $scope.$watch('loaded', function () {
      if ($scope.loaded) {
        console.log("load active variables");
        getActive();
      }
    });

    var getActive = function () {
      apiGet().getActive().then(
        function onSuccess(response) {
          if (response.status === 200) { // if test started
            $scope.toggleButtonText();
            started = true;
            if ('clusters' in response.data) { // resolve clusters
              var clusters = response.data.clusters;
              clusters.forEach(function (cluster) {
                var found = $filter('getById')($scope.config.clusters, cluster);
                if (found !== null) {
                  found.object.selected = true;
                  $scope.config.clusters[found.index] = found.object;
                }
              });
            }

            if ('loadtest' in response.data) {// resolve loadtest data
              var loadtests = response.data.loadtest.tests;

              loadtests.forEach(function (loadtest) {
                var found = $filter('getById')($scope.config.loadtest, loadtest.id);
                if (found !== null) {
                  $scope.config.loadtest[found.index] = loadtest;
                }
              });
            }

            if ('rollingupdate' in response.data) {
              var rolling = response.data.rollingupdate
              if (rolling.uph>0){
                $scope.config.rollingtest[0].uph = rolling.uph;
              }
            }
            // TODO resolve chaos monkey
          }
          $scope.$applyAsync();
        }
      );
    };

    /* Page specific functions */
    $scope.resolveMethod = function () {
      if (!started) {
        $scope.start();
      } else {
        $scope.stop();
      }
    };

    $scope.update = function () {
      if (started) { // If test not started ignore update calls
        apiPost().updateTest($scope.config); // todo handle response
      }
    };

    $scope.start = function () {
      resultsService.clear(); // clear results when starting a new test
      $scope.$applyAsync();
      apiPost().startTest($scope.config)
        .then(
          function mySuccess(response) {
            started = true;
            $scope.toggleButtonText();
            $location.path('/results');
          }, function myError(response) {
            console.log(response);
            // TODO handle error, show error view
          });
    };

    $scope.clear = function () {
      started = false;
      $scope.buttonText = 'Start';
    };

    $scope.stop = function () {
      apiPost().stopTest().then(function onSuccess(response) {
        $scope.clear();
      }, function onError(response) {
        console.log(response);
        // TODO handle error, show error view
      });
    };

    $scope.toggleButtonText = function () {
      if ($scope.buttonText === 'Start') {
        $scope.buttonText = 'Stop';
      } else {
        $scope.buttonText = 'Start';
      }
    };

  }])
  .filter('getById', function () { //filter for finding index & object from array with id
    return function (array, id) {
      var toReturn = {};
      for (var i = 0; i < array.length; i++) {
        if (array[i].id === id) {
          toReturn.index = i;
          toReturn.object = array[i];
          return toReturn;
        }
      }
      return null;
    };
  })
  .directive('integer', function () { //parse value to int for view
    return {
      require: 'ngModel',
      link: function (scope, ele, attr, ctrl) {
        ctrl.$parsers.unshift(function (viewValue) {
          return parseInt(viewValue, 10);
        });
      }
    };
  });



