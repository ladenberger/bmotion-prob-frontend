/**
 * BMotion Studio for ProB Directive visualisation view module
 *
 */
define(['angular', 'bms.func', 'jquery'], function(angular, bms, $) {

  return angular.module('bms.directive.visualisation.view', ['prob.modal', 'bms.api'])
    .directive('bmsVisualisationView', ['$rootScope', 'bmsApiService', 'bmsSessionService', 'bmsVisualizationService', 'ws', 'bmsModalService', 'trigger', '$compile', '$http', '$q',
      function($rootScope, bmsApiService, bmsSessionService, bmsVisualizationService, ws, bmsModalService, trigger, $compile, $http, $q) {
        'use strict';
        return {
          replace: false,
          scope: {
            view: '@bmsVisualisationView',
            sessionId: '@bmsVisualisationSession'
          },
          template: '<iframe src="" frameBorder="0" class="fullWidthHeight bmsIframe"></iframe>',
          controller: ['$scope', function($scope) {

            $scope.id = bms.uuid(); // Visualization ID
            $scope.attrs = {};
            $scope.values = bmsApiService.getValues($scope.id);

            bmsVisualizationService.setCurrentVisualizationId($scope.id);
            $scope.visualization = bmsVisualizationService.getVisualization($scope.id);

            // --------------------------------------

            ws.on('checkObserver', function(cause, s) {
              $scope.visualization.stateId = s.stateId;
              $scope.visualization.traceId = s.traceId;
              if (cause === trigger.TRIGGER_MODEL_INITIALISED) {
                $scope.visualization.initialised = true;
              }
              if (cause === trigger.TRIGGER_MODEL_SETUP_CONSTANTS) {
                $scope.visualization.setupConstants = true;
              }
              if ($scope.visualization.traceId == s.traceId) {
                bmsApiService.triggerObservers($scope.id, s.stateId, cause);
                bmsApiService.triggerListeners($scope.id, cause);
              }
            });

            $scope.$on('$destroy', function() {
              ws.removeAllListeners("checkObserver");
            });

          }],
          link: function($scope, $element, attrs, ctrl) {

            var iframe = $($element.contents());
            iframe.attr("id", $scope.id);
            var iframeContents;
            $scope.visualization.container = iframe;

            $scope.$watch(function() {
              return bmsApiService.getValues($scope.id);
            }, function(newValue) {
              $scope.values = newValue;
              $scope.applyValues();
            }, true);

            $scope.getValue = function(bmsid, attr, defaultValue) {
              var returnValue = defaultValue === 'undefined' ? undefined : defaultValue;
              var ele = $scope.values[bmsid];
              if (ele) {
                returnValue = ele[attr] === undefined ? returnValue : ele[attr];
              }
              return returnValue;
            };

            $scope.applyValues = function() {
              for (var bmsid in $scope.values) {
                if ($scope.attrs[bmsid] === undefined) {
                  $scope.attrs[bmsid] = [];
                }
                var nattrs = $scope.values[bmsid];
                for (var a in nattrs) {
                  if ($scope.attrs[bmsid].indexOf(a) === -1) {
                    var orgElement = iframeContents.find('[data-bms-id=' + bmsid + ']');
                    var attrDefault = orgElement.attr(a);
                    // Special case for class attributes
                    if (a === "class" && attrDefault === undefined) {
                      attrDefault = ""
                    }
                    orgElement
                      .attr("ng-attr-" + a, "{{getValue('" + bmsid + "','" + a + "','" + attrDefault + "')}}");
                    $compile(orgElement)($scope);
                    $scope.attrs[bmsid].push(a);
                  }
                }
              }
            };

            $scope.$on('visualizationSaved', function(evt, svg) {

              var svgItem = bmsVisualizationService.getSvg($scope.id, svg);
              svgItem.defer = $q.defer();
              bmsVisualizationService.clearObservers($scope.id, 'js');
              bmsVisualizationService.clearEvents($scope.id, 'js');
              bmsVisualizationService.clearListeners($scope.id);
              iframe.attr('src', iframe.attr('src'));
              svgItem.defer.promise
                .then(function() {
                  bmsApiService.triggerJsonObservers($scope.id);
                  bmsApiService.setupJsonEvents($scope.id);
                });

            });

            var loadManifestData = function(path) {
              var defer = $q.defer();
              $http.get(path)
                .success(function(manifestData) {
                  defer.resolve(manifestData);
                })
                .error(function(data, status, headers, config) {
                  if (status === 404) {
                    defer.reject("File not found: " + config.url);
                  } else {
                    defer.reject("Some error occurred while requesting file " + config.url);
                  }
                });
              return defer.promise;
            };

            var loadViewData = function(view, manifestData) {
              var defer = $q.defer();
              var views = manifestData['views'];
              if (views) {
                angular.forEach(manifestData['views'], function(v) {
                  if (v['id'] === view) {
                    defer.resolve(v);
                  }
                });
              } else {
                defer.resolve({
                  id: 'root',
                  template: manifestData['template']
                });
              }
              return defer.promise;
            };

            var loadTemplate = function(visId, templateFolder, template) {
              var defer = $q.defer();
              iframe.attr('src', templateFolder + '/' + template).attr('id', visId);
              iframe.load(function() {
                iframeContents = $(iframe.contents());
                $compile(iframeContents)($scope);
                defer.resolve();
              });
              return defer.promise;
            };

            var initJsonEvents = function(visId, templateFolder, viewData) {

              var defer = $q.defer();

              //var eventsViewPath = viewData['events'] ? viewData['events'] : viewData['id'] + '.events.json';
              var eventsViewPath = viewData['events'];
              if (eventsViewPath) {
                $http.get(templateFolder + '/' + eventsViewPath)
                  .success(function(data) {
                    // TODO: We need to validate the schema of the view data json file!
                    angular.forEach(data['events'], function(e) {
                      bmsApiService.addEvent($scope.id, e['type'], e['data'], 'json');
                    });
                    defer.resolve();
                  })
                  .error(function() {
                    // TODO: Do we need an error message? The view data json file should be optional!
                    defer.resolve();
                  });
              } else {
                defer.resolve();
              }

              return defer.promise;

            };

            var initJsonObservers = function(visId, templateFolder, viewData) {

              var defer = $q.defer();

              // Get observer data from observers.json file
              //var observersViewPath = viewData['observers'] ? viewData['observers'] : viewData['id'] + '.observers.json';
              var observersViewPath = viewData['observers'];
              if (observersViewPath) {
                $http.get(templateFolder + '/' + observersViewPath)
                  .success(function(data) {
                    // TODO: We need to validate the schema of the view data json file!
                    angular.forEach(data['observers'], function(o) {
                      bmsApiService.addObserver($scope.id, o.type, o.data, 'json');
                    });
                    defer.resolve();
                  })
                  .error(function() {
                    // TODO: Do we need an error message? The view data json file should be optional!
                    defer.resolve();
                  });
              } else {
                defer.resolve();
              }

              return defer.promise;

            };

            var initView = function(sessionId, view, file) {

              bmsModalService.loading("Initialising View ...");

              $scope.sessionId = sessionId;
              $scope.view = view;
              $scope.file = file;

              bmsSessionService.loadServerData(sessionId)
                .then(function(serverData) {

                  $rootScope.$broadcast('setProBViewTraceId', serverData['traceId']);
                  $scope.visualization = $.extend($scope.visualization, serverData);
                  var templateFolder = serverData['templateFolder'];

                  return loadManifestData(templateFolder + '/' + file)
                    .then(function(manifestData) {
                        $scope.visualization.manifest = $.extend({
                          tool: 'BAnimation'
                        }, manifestData);
                        return loadViewData(view, $scope.visualization.manifest);
                      },
                      function(error) {
                        bmsModalService.openErrorDialog(error);
                      })
                    .then(function(viewData) {
                      $scope.visualization.view = viewData;
                      loadTemplate($scope.id, templateFolder, viewData.template)
                        .then(function() {
                          return initJsonObservers($scope.id, templateFolder, viewData)
                        })
                        .then(function() {
                          return initJsonEvents($scope.id, templateFolder, viewData)
                        })
                        .then(function() {
                          $rootScope.$broadcast('visualizationLoaded', $scope.visualization);
                          bmsModalService.endLoading();
                        });
                    });
                }, function(errors) {
                  bmsModalService.openErrorDialog(errors);
                });

            };

            // Initialise view ...
            initView(attrs['bmsVisualisationSession'], attrs['bmsVisualisationView'], attrs['bmsVisualisationFile']);

          }
        }
      }
    ]);

});
