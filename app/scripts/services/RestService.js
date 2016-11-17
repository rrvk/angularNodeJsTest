'use strict';
angular.module('app.restService', ['constants']) // create module restService
  .factory('apiGet', ['$http', 'API_URL', 'CLUSTER_PATH', 'TEST_PATH', 'ACTIVE_PATH',
    function (http, prefix, clusterPath, testPath, activePath) {
      var functions = {};

      functions.getForPath = function getForPath(path) {
        return http.get(prefix + path);
      };

      functions.getClusters = function getClusters() {
        return http.get(prefix + clusterPath);
      };

      functions.getTests = function getTests() {
        return http.get(prefix + testPath);
      };

      functions.getActive = function getActive() {
        return http.get(prefix + activePath);
      };

      return function () {
        return functions;
      };
    }])
  .factory('apiPost', ['$http', 'API_URL', 'START_PATH', 'UPDATE_PATH', 'STOP_PATH',
    function (http, prefix, startPath, updatePath, stopPath) {
      var functions = [];

      var resolveParams = function (config) {
        // todo chaosmonkey
        var selection = {};
        selection.clusters = [];
        selection.loadtest = [];

        config.clusters.forEach(function (item) {
          if (item.selected) {
            selection.clusters.push(item.id);
          }
        });

        config.loadtest.forEach(function (item) {
          if (item.rps > 0) {
            selection.loadtest.push(item);
          }
        });


        config.rollingtest.forEach(function (item) {
          if (item.uph > 0) {
            if (typeof selection.rollingupdate == "undefined") {
              selection.rollingupdate = {};
            }
            selection.rollingupdate.uph = item.uph;
          }
        });

        return selection;
      };

      functions.startTest = function startTest(config) {
        var params = resolveParams(config);
        return http.post((prefix + startPath), params);
      };

      functions.updateTest = function updateTest(config) {
        var params = resolveParams(config);
        return http.post((prefix + updatePath), params);
      };

      functions.stopTest = function stopTest() {
        // Stop all
        var params = {};
        params.loadtest = [];
        params.rollingupdate = [];
        params.chaosmonkey = [];
        return http.post(prefix + stopPath, params);
      };

      return function () {
        return functions;
      };
    }
  ])
;

