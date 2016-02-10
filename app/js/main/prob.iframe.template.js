/**
 * BMotion Studio for ProB IFrame Module
 *
 */
define(['angular', 'bms.func', 'jquery', 'bms.api', 'bms.api.extern', 'prob.modal'], function(angular, bms, $) {

  var module = angular.module('prob.iframe.template', ['prob.modal', 'bms.api'])
    .directive('bmsVisualisationView', ['$rootScope', 'bmsApiService', 'bmsSessionService', 'bmsVisualizationService', 'ws', 'bmsModalService', 'trigger', '$compile', '$http', '$q',
      function($rootScope, bmsApiService, bmsSessionService, bmsVisualizationService, ws, bmsModalService, trigger, $compile, $http, $q) {
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
    .directive('bmsWidget', ['bmsVisualizationService', 'bmsApiService',
      function(bmsVisualizationService, bmsApiService) {
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
                  .attr("class", jele.attr("class"))
                  .attr("id", jele.attr("id"))
                  .css("position", "absolute")
                  .css("left", offset.left - 5 + "px")
                  .css("top", offset.top - 3 + "px");

                var parent = $(jele.parent());
                if (parent.prop("tagName") === "g") {
                  newInput.attr("name", parent.attr("id"));
                }

                var vis = bmsVisualizationService.getVisualization($scope.id);
                vis.container.contents().find("body").append(newInput);
                jele.remove();

                break;
              case "icheckbox":

                var jele = $(element);
                var offset = jele.offset();
                // Create new radio button
                var newInput = $('<input type="checkbox"/>');
                newInput
                  .attr("value", jele.attr("data-value"))
                  .attr("class", jele.attr("class"))
                  .attr("id", jele.attr("id"))
                  .attr("checked", jele.attr("data-checked") === "true" ? true : false)
                  .css("position", "absolute")
                  .css("left", offset.left - 5 + "px")
                  .css("top", offset.top - 2 + "px");

                var parent = $(jele.parent());
                if (parent.prop("tagName") === "g") {
                  newInput.attr("name", parent.attr("id"));
                }

                var vis = bmsVisualizationService.getVisualization($scope.id);
                vis.container.contents().find("body").append(newInput);
                jele.remove();

                break;
              case "ibutton":

                var jele = $(element);
                var offset = jele.offset();

                var rect = jele.find("rect");
                // Create new radio button
                var newInput = $('<button>' + jele.attr('data-text') + '</button>');
                newInput
                  .attr("class", jele.attr("class"))
                  .attr("id", jele.attr("id"))
                  .css("position", "absolute")
                  .css("width", parseInt(rect.attr("width")) + "px")
                  .css("height", parseInt(rect.attr("height")) + "px")
                  .css("left", offset.left + "px")
                  .css("top", offset.top + "px");
                var vis = bmsVisualizationService.getVisualization($scope.id);
                vis.container.contents().find("body").append(newInput);
                jele.remove();

                break;
              case "iinput":
                var jele = $(element);
                var rect = jele.find("rect");
                var offset = jele.offset();
                var btype = jele.attr("data-btype");
                var newInput = $('<input type="text"/>');
                newInput
                  .attr("class", jele.attr("class"))
                  .attr("id", jele.attr("id"))
                  .attr("placeholder", jele.attr("data-placeholder"))
                  .css("position", "absolute")
                  .css("left", offset.left + "px")
                  .css("top", offset.top + "px")
                  .css("width", parseInt(rect.attr("width")) - 4 + "px")
                  .css("height", parseInt(rect.attr("height")) - 5 + "px");
                jele.remove();
                var vis = bmsVisualizationService.getVisualization($scope.id);
                vis.container.contents().find("body").append(newInput);
                newInput.qtip({
                  content: {
                    text: ''
                  },
                  position: {
                    my: 'bottom left',
                    at: 'top right',
                    effect: false,
                    viewport: $(window),
                    adjust: {
                      y: 45
                    }
                  },
                  show: {
                    event: false
                  },
                  hide: {
                    fixed: true,
                    delay: 2000
                  },
                  style: {
                    classes: 'qtip-red'
                  }
                });
                newInput.on('input', function() {
                  var input = $(this);
                  //var data = btype === 'STRING' ? "\"" + input.val() + "\"" : input.val();
                  var data = input.val();
                  bmsApiService.eval($scope.id, {
                    formulas: ["bool(" + data + " : " + btype + ")"],
                    trigger: function(values) {
                      if (values[0] === 'FALSE') {
                        input.qtip('option', 'content.text', "Please enter a valid <strong>" + btype + "</strong>").qtip('show');
                      } else {
                        input.qtip('hide');
                      }
                    },
                    error: function(errors) {
                      input.qtip('option', 'content.text', "Please enter a valid <strong>" + btype + "</strong>").qtip('show');
                    }
                  });
                });
                break;
            }

          }
        };
      }
    ]);

  return module;

});
