/**
 * Created by Paulien on 2-5-2016.
 */
'use strict';
angular.module('app.resultsService', ['constants']) // create module restService
  .factory('resultsService', ['$filter', 'API_URL', function ($filter, API_URL) {
    var results = [];
    var socket = {client: null, stomp: null, connecting: true, connectMessage: 'Connecting to server...'}; //https://spring.io/guides/gs/messaging-stomp-websocket/
    var observers = [];
    var updateEvent = 'results:update';
    var reconnectEvent = 'results:reconnect';
    var clearEvent = 'results:clear';

    var attach = function attach(id, event, callback) {
      console.log('Attached observer');
      //var found = $filter('getById')(results, id);
      if (observers[event] === undefined || observers[event].id === id) {
        observers[event] = {'id': id, 'event': event, 'callback': callback};
      } else {
        console.error('Observer id already exists.');
      }
    };

    var detach = function (id, event) {
      console.log('Detached observer');
      var found = $filter('getById')(results, id);
      if (found !== null) {
        if (found.item.event === event) {
          observers.remove(found.index);
        }
      }
    };

    var update = function update(body) {
      var found = $filter('getByClusterTestId')(results, body.clusterId, body.testId);
      if (found !== null) {
        if (body.type == "loadtest") {
          if (found.item.responses < body.responses)
            results[found.index] = body;
        }
        else if (body.type == "rollingupdate") {
          results[found.index] = body;
        }
        else {
          // todo choas monkey
        }
      } else {
        results.push(body);
      }
      //  }
    };

    var clear = function clear() {
      results = [];
      notifyObservers(clearEvent, null);
    };

    var notify = function (message) {
      var body = JSON.parse(message.body);
      update(body);
      notifyObservers(updateEvent, body);
    };

    function notifyObservers(event, body) {
      if (observers[event] !== undefined && 'callback' in observers[event]) {
        observers[event].callback(results, body);
      }
    }

    var reconnect = function () {
      socket.connectMessage = 'Lost connection, retrying...';
      socket.connecting = true;
      notifyObservers(reconnectEvent, null);
      setTimeout('reconnect: ' + initSockets(), 1000);
    };

    var initSockets = function () {
      socket.client = new SockJS(API_URL + '/notify');
      socket.stomp = Stomp.over(socket.client);
      socket.stomp.connect({}, function () {
        socket.connecting = false;
        socket.connectMessage = 'Initializing connection...';
        notifyObservers(reconnectEvent);
        socket.stomp.subscribe('/topic/tests', notify);
      });
      socket.client.onclose = reconnect;
    };

    if (socket.client === null)
      initSockets();

    return {
      state: results,
      socket: socket,
      attach: attach,
      detach: detach,
      clear: clear
    }

  }]).filter('getByClusterTestId', function () {
  return function (array, clusterId, testId) {
    var found = null;
    for (var i = 0; i < array.length; i++) {
      var item = array[i];
      if (item.clusterId === clusterId && item.testId === testId) {
        found = {};
        found.index = i;
        found.item = item;
        return found;
      }
    }
    return null;
  }
});
