/**
 * BMotion Studio Session Module
 *
 */
define(['angular', 'bms.socket'], function(angular) {

  return angular.module('bms.session', ['bms.socket'])

  .factory('bmsSessionService', ['$q', 'ws',
    function($q, ws) {

      var sessionId;

      var factory = {

        loadServerData: function(sessionId) {
          var defer = $q.defer();
          ws.emit('initView', {
            data: {
              id: sessionId
            }
          }, function(data) {
            if (data['errors']) {
              defer.reject(data['errors']);
            } else {
              defer.resolve(data);
            }
          });
          return defer.promise;
        },
        destroy: function(sessionId) {
          var defer = $q.defer();
          ws.emit('destroySession', {
            data: {
              id: sessionId
            }
          }, function() {
            defer.resolve()
          });
          return defer.promise;
        },
        init: function(modelPath, options, manifestFilePath) {
          var defer = $q.defer();
          ws.emit('initSession', {
            data: {
              manifest: manifestFilePath,
              model: modelPath,
              options: options
            }
          }, function(r) {
            if (r['errors']) {
              defer.reject(r['errors'])
            } else {
              sessionId = r;
              defer.resolve(r)
            }
          });
          return defer.promise;
        },
        initFormalModelOnlySession: function(modelPath, options) {
          var defer = $q.defer();
          factory.init(modelPath, options)
            .then(function(sid) {
              defer.resolve(sid);
            }, function(errors) {
              defer.reject(errors)
            });
          return defer.promise;
        },
        getSessionId: function() {
          return sessionId;
        },
        setSessionId: function(s) {
          sessionId = s;
        }

      };

      return factory;

    }
  ])

});
