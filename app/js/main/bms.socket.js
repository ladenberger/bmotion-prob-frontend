/**
 * BMotion Studio Socket Module
 *
 */
define(['socketio', 'angular', 'bms.config', 'prob.modal'], function(io, angular) {

  return angular.module('bms.socket', ['bms.config', 'prob.modal'])
    .factory('bmsSocketService', ['bmsConfigService', '$q', 'bmsModalService',
      function(bmsConfigService, $q, bmsModalService) {
        'use strict';
        var socket = null;
        return {
          socket: function() {
            var defer = $q.defer();
            if (socket === null) {
              bmsConfigService.getConfig()
                .then(function(config) {
                  socket = io.connect('http://' + config.socket.host + ':' + config.socket.port);
                  socket.on('disconnect', function() {
                    bmsModalService.setError("BMotion Studio for ProB server disconnected");
                  });
                  defer.resolve(socket);
                }, function(error) {
                  defer.reject(error);
                });
            } else {
              defer.resolve(socket);
            }
            return defer.promise;
          }
        };
      }
    ])
    .factory('ws', ['$rootScope', 'bmsSocketService', 'bmsModalService',
      function($rootScope, bmsSocketService, bmsModalService) {
        'use strict';
        return {
          emit: function(event, data, callback) {
            bmsSocketService.socket()
              .then(function(socket) {
                socket.emit(event, data, function() {
                  var args = arguments;
                  $rootScope.$apply(function() {
                    if (callback) {
                      callback.apply(null, args);
                    }
                  });
                });
              }, function(error) {
                bmsModalService.openErrorDialog(error);
              });
          },
          on: function(event, callback) {
            bmsSocketService.socket()
              .then(function(socket) {
                socket.on(event, function() {
                  var args = arguments;
                  $rootScope.$apply(function() {
                    callback.apply(null, args);
                  });
                });
              }, function(error) {
                bmsModalService.openErrorDialog(error);
              });
          },
          removeAllListeners: function(event) {
            bmsSocketService.socket()
              .then(function(socket) {
                socket.removeAllListeners(event);
              }, function(error) {
                bmsModalService.openErrorDialog(error);
              });
          }
        };
      }
    ]);

});
