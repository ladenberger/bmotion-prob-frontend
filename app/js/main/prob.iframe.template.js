/**
 * BMotion Studio for ProB IFrame Module
 *
 */
define(['angular', 'bms.func', 'jquery', 'prob.observers', 'prob.modal'], function(angular, bms, $) {

  var module = angular.module('prob.iframe.template', ['prob.observers', 'prob.modal'])
    .directive('bmsVisualisationView', ['$rootScope', 'bmsSessionService', 'bmsVisualizationService', 'bmsObserverService', 'ws', '$injector', 'bmsModalService', 'trigger', '$compile', '$http', '$timeout', '$q',
      function($rootScope, bmsSessionService, bmsVisualizationService, bmsObserverService, ws, $injector, bmsModalService, trigger, $compile, $http, $timeout, $q) {
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
            $scope.values = {};

            bmsVisualizationService.setCurrentVisualizationId($scope.id);
            $scope.visualization = bmsVisualizationService.getVisualization($scope.id);

            $scope.checkObservers = function(observers, stateId, cause) {

              var stateId = stateId ? stateId : $scope.visualization.stateId;
              var cause = cause ? cause : trigger.TRIGGER_ANIMATION_CHANGED;
              var initialised = $scope.visualization.initialised ? $scope.visualization.initialised : false;

              if (stateId && initialised) {

                // Collect values from observers
                bmsObserverService.checkObservers($scope.sessionId, $scope.id, observers, $scope.visualization.container.contents(), stateId, cause)
                  .then(function(data) {
                    angular.forEach(data, function(value) {
                      if (value !== undefined) {
                        $.extend(true, $scope.values, value);
                      }
                    });
                    if (!bms.isEmpty($scope.values)) {
                      $scope.applyValues();
                    }
                  });

              }

            };

            $scope.triggerObserver = function(observer, stateId, cause) {
              $scope.checkObservers([observer], stateId, cause);
            };

            $scope.triggerJsonObservers = function(stateId, cause) {
              $scope.triggerObservers(stateId, cause, 'json');
            };

            $scope.triggerObservers = function(stateId, cause, list) {
              var observers = bmsVisualizationService.getObservers($scope.id, list);
              $scope.checkObservers(observers, stateId, cause);
            };

            $scope.triggerListeners = function(cause) {
              var vis = bmsVisualizationService.getVisualization($scope.id);
              if (vis.listener) {
                angular.forEach(vis.listener[cause], function(l) {
                  if (!l.executed) {
                    l.callback(vis);
                    // Init listener should be called only once
                    if (cause === "ModelInitialised") l.executed = true;
                  }
                });
              }
            };

            $scope.setupEvents = function(list) {
              var events = bmsVisualizationService.getEvents($scope.id, list);
              bmsObserverService.setupEvents($scope.sessionId, $scope.id, events, $scope.visualization.container.contents(), $scope.visualization.traceId);
            };

            $scope.setupJsonEvents = function() {
              $scope.setupEvents('json');
            };

            $scope.setupEvent = function(evt) {
              bmsObserverService.setupEvent($scope.sessionId, $scope.id, evt, $scope.visualization.container.contents(), $scope.visualization.traceId);
            };

            // --------------------------------------
            // Parent API (called from prob.template)
            // --------------------------------------
            $scope.addObserver = function(type, data, list) {
              var observer = {
                type: type,
                data: data
              };
              // Add observer ..
              bmsVisualizationService.addObserver($scope.id, observer, list);
              // ... and trigger observer
              if ($scope.visualization.stateId !== 'root' && $scope.visualization.initialised && $scope.visualization.lastOperation !== '$setup_constants') {
                $scope.triggerObserver(observer, $scope.visualization.stateId, data.cause);
              }
            };

            $scope.addEvent = function(type, data, list) {
              var ev = {
                type: type,
                data: data
              };
              // Add event ...
              bmsVisualizationService.addEvent($scope.id, ev, list);
              // ... and setup event
              var instance = $injector.get(type, "");
              if (instance) {
                instance.setup($scope.sessionId, $scope.id, ev, $scope.visualization.container.contents(), $scope.visualization.traceId);
              }
            };

            $scope.eval = function(options) {

              var options = bms.normalize($.extend({
                formulas: [],
                translate: false,
                trigger: function() {}
              }, options), ["trigger"]);

              ws.emit('evaluateFormulas', {
                data: {
                  id: $scope.sessionId,
                  formulas: options.formulas.map(function(f) {
                    return {
                      formula: f,
                      translate: options.translate
                    }
                  })
                }
              }, function(r) {

                var errors = [];
                var results = [];

                angular.forEach(options.formulas, function(f) {
                  if (r[f]['error']) {
                    var errorMsg = r[f]['error'] + " ("
                    if (options.selector) {
                      errorMsg = errorMsg + "selector: " + options.selector + ", ";
                    }
                    errorMsg = errorMsg + "formula: " + f + ")";
                    errors.push(errorMsg);
                  } else {
                    results.push(r[f]['trans'] !== undefined ? r[f]['trans'] : r[f]['result']);
                  }
                });

                if (errors.length === 0) {
                  if (options.selector) {
                    options.trigger($scope.visualization.container.contents().find(options.selector), results);
                  } else {
                    options.trigger(results);
                  }
                } else {
                  bmsModalService.openErrorDialog(errors);
                }

              });

            };

            $scope.on = function(what, callback) {
              var listener = bmsVisualizationService.addListener($scope.id, what, callback);
              if (what === "ModelInitialised" && $scope.visualization.initialised && listener) {
                var vis = bmsVisualizationService.getVisualization($scope.id);
                // Init listener should be called only once
                listener.callback(vis);
                listener.executed = true;
              }
            };
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
                $scope.triggerObservers(s.stateId, cause);
                $scope.triggerListeners(cause);
              }
            });

            $scope.$on('$destroy', function() {
              ws.removeAllListeners("checkObserver");
            });

            $scope.reloadTemplate = function() {
              bmsObserverService.clearBmsIdCache($scope.id);
              $scope.attrs = {};
              $scope.triggerObservers();
              $scope.setupEvents();
            };

          }],
          link: function($scope, $element, attrs, ctrl) {

            var iframe = $($element.contents());
            var iframeContents;
            $scope.visualization.container = iframe;

            $scope.getValue = function(bmsid, attr, defaultValue) {
              var returnValue = defaultValue === 'undefined' ? undefined : defaultValue;
              var ele = $scope.values[bmsid];
              if (ele) {
                returnValue = ele[attr] === undefined ? returnValue : ele[attr];
              }
              return returnValue;
            };

            $scope.applyValues = function() {
              for (bmsid in $scope.values) {
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
              //document.getElementById($scope.id).contentWindow.location.reload();
              svgItem.defer.promise
                .then(function() {
                  $scope.triggerJsonObservers();
                  $scope.setupJsonEvents();
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
                      $scope.addEvent(e['type'], e['data'], 'json');
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
                      $scope.addObserver(o.type, o.data, 'json');
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
    ])
    .directive('bmsSvg', ['$http', '$compile', 'bmsVisualizationService',
      function($http, $compile, bmsVisualizationService) {
        return {
          replace: false,
          link: function($scope, element, attrs) {
            var svg = attrs['bmsSvg'];
            var vis = bmsVisualizationService.getVisualization($scope.id);
            var svgObj = bmsVisualizationService.addSvg($scope.id, svg);
            var reloadTemplate = function() {
              return $http.get(vis['templateFolder'] + '/' + svg)
                .success(function(svgCode) {
                  element.html(svgCode);
                  $compile(element.contents())($scope);
                  if (svgObj.defer) svgObj.defer.resolve();
                });
            };
            reloadTemplate();
          }
        }
      }
    ])
    .factory('bmsWidgetService', ['bmsVisualizationService',
      function(bmsVisualizationService) {

        var fieldSetElements = {};

        return {
          getFieldSet: function(visid, id) {
            var fieldSetElement = fieldSetElements[id];
            if (!fieldSetElement) {
              fieldSetElement = $("<fieldset>");
              fieldSetElement.attr("id", id);
              var vis = bmsVisualizationService.getVisualization(visid);
              vis.container.contents().find("body").append(fieldSetElement);
              fieldSetElements[id] = fieldSetElement;
            }
            return fieldSetElement;
          }

        }

      }
    ])
    .directive('bmsWidget', ['bmsVisualizationService', 'bmsWidgetService',
      function(bmsVisualizationService, bmsWidgetService) {
        return {
          link: function($scope, element, attr) {
            var type = attr["bmsWidget"];
            switch (type) {
              case "iarea":
                $(element).css("opacity", 0.1);
                break;
              case "iradio":

                var jele = $(element);
                var offset = jele.offset();

                // Create new radio button
                var newInput = $('<input type="radio"/>');
                newInput
                  .attr("value", jele.attr("data-value"))
                  .attr("checked", jele.attr("data-checked") === "true" ? true : false)
                  .attr("id", jele.attr("id"))
                  .css("position", "absolute")
                  .css("left", offset.left - 5 + "px")
                  .css("top", offset.top - 3 + "px");

                var parent = $(jele.parent());
                if (parent.prop("tagName") === "g") {
                  newInput.attr("name", parent.attr("id"));
                }

                //var fieldsetElement = bmsWidgetService.getFieldSet($scope.id, parentId);
                var vis = bmsVisualizationService.getVisualization($scope.id);
                vis.container.contents().find("body").append(newInput);
                //fieldsetElement.append(newInput);
                jele.remove();

                break;
              case "icheckbox":

                var jele = $(element);
                var offset = jele.offset();
                // Create new radio button
                var newInput = $('<input type="checkbox"/>');
                newInput
                  .attr("value", jele.attr("data-value"))
                  .attr("id", jele.attr("id"))
                  .attr("checked", jele.attr("data-checked") === "true" ? true : false)
                  .css("position", "absolute")
                  .css("left", offset.left - 5 + "px")
                  .css("top", offset.top - 2 + "px");

                var parent = $(jele.parent());
                if (parent.prop("tagName") === "g") {
                  newInput.attr("name", parent.attr("id"));
                }

                //var fieldsetElement = bmsWidgetService.getFieldSet($scope.id, parentId);
                var vis = bmsVisualizationService.getVisualization($scope.id);
                vis.container.contents().find("body").append(newInput);
                //fieldsetElement.append(newInput);
                jele.remove();

                break;
              case "input":
                var jele = $(element);
                var offset = jele.offset();
                var width = jele.attr("width");
                var height = jele.attr("height");
                var newInput = $('<input type="text"/>');
                newInput
                  .attr("id", jele.attr("id"))
                  .css("position", "absolute")
                  .css("left", offset.left + "px")
                  .css("top", offset.top + "px")
                  .css("width", (jele.attr("width") - 4) + "px")
                  .css("height", (jele.attr("height") - 5) + "px");
                jele.remove();
                var vis = bmsVisualizationService.getVisualization($scope.id);
                vis.container.contents().find("body").append(newInput);
                break;
            }

          }
        };
      }
    ]);

  return module;

});
