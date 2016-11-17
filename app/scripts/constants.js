/**
 * Created by Paulien on 22-4-2016.
 */
'use strict';
angular.module('constants',[])
  .constant('API_URL', 'http://localhost:8080')
  .constant('CLUSTER_PATH', '/clusters')
  .constant('TEST_PATH', '/tests')
  .constant('START_PATH', '/start')
  .constant('STOP_PATH', '/stop')
  .constant('UPDATE_PATH', '/configure')
  .constant('ACTIVE_PATH', '/active');
  
