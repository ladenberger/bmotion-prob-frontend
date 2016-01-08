/**
 * BMotion Studio for ProB Editor Iframe Module
 *
 */
define(['angularAMD', 'code-mirror!javascript', 'angular', 'jquery.jgraduate', 'jpicker',
  'jquery.draginput', 'mousewheel', 'taphold', 'requestanimationframe',
  'method-draw', 'angular-ui-codemirror', 'angular-xeditable', 'ui-bootstrap',
  'ui-bootstrap-tpls', 'angular-sanitize'
], function(angularAMD, CodeMirror) {

  var module = angular.module('prob.editor', ['ui.codemirror', 'xeditable', 'ui.bootstrap', 'ngSanitize'])
    .run(function(editableOptions, editableThemes) {
      window.CodeMirror = CodeMirror;
      editableOptions.theme = 'default';
      editableThemes['default'].submitTpl = '<button type="submit"><i class="fa fa-floppy-o"></i></button>';
      editableThemes['default'].cancelTpl = '<button type="button" ng-click="$form.$cancel()"><i class="fa fa-ban"></i></button>';
    })
    .factory('$parentScope', ['$window', function($window) {
      return $window.parent.angular.element($window.frameElement).scope();
    }])
    .factory('bmsEditorCommonService', ['$q', function($q) {

      var visualization;
      return {
        setVisualization: function(vis) {
          visualization = vis;
        },
        getVisualization: function() {
          return visualization;
        },
        isInitialised: $q.defer()
      }

    }])
    .factory('bmsParentService', ['$parentScope', function($parentScope) {
      return {
        init: function() {
          return $parentScope.init();
        },
        save: function(svg) {
          $parentScope.save(svg);
        },
        saveObservers: function() {
          $parentScope.saveObservers();
        },
        saveEvents: function() {
          $parentScope.saveEvents();
        },
        addObserver: function(type, data) {
          $parentScope.addObserver(type, data);
        },
        addEvent: function(type, data) {
          $parentScope.addEvent(type, data);
        },
        disableEditor: function(reason) {
          $parentScope.disableEditor(reason);
        },
        openDialog: function(msg, cb) {
          $parentScope.openDialog(msg, cb);
        },
        bmsModalService: $parentScope.bmsModalService
      };
    }])
    .factory('bmsJsEditorService', ['$uibModal', '$timeout', function($uibModal, $timeout) {

      return {

        openJsEditor: function(fn, el, doc) {

          var code = el.data[fn];

          if ($.isFunction(code)) {
            var entire = code.toString(); // this part may fail!
            code = entire.substring(entire.indexOf("{") + 1, entire.lastIndexOf("}"));
          }

          var modalInstance = $uibModal.open({
            templateUrl: 'templates/bms-js-editor.html',
            controller: function($scope, $modalInstance, code, doc) {

              $scope.code = code;

              $scope.doc = doc;

              $scope.isCollapsed = true;

              $modalInstance.setRefresh = function(b) {
                $scope.refresh = b;
              };

              $scope.close = function() {
                $modalInstance.close();
              };

              $scope.ok = function() {
                $modalInstance.close($scope.code);
              };

              $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
              };

              $scope.codemirrorLoaded = function(_editor) {
                $timeout(function() {
                  _editor.refresh();
                });
              };

              $scope.editorOptions = {
                lineWrapping: true,
                mode: 'javascript',
                onLoad: $scope.codemirrorLoaded
              };

            },
            resolve: {
              code: function() {
                return code;
              },
              doc: function() {
                return doc;
              }
            },
            backdrop: false
          });
          modalInstance.result.then(function(code) {
            el.data[fn] = code;
            //$scope.$emit('highlightObserver', false);
          }, function() {
            //$scope.$emit('highlightObserver', false);
          });
        }

      };

    }])
    .directive('ngConfirmClick', [function() {
      return {
        link: function(scope, element, attr) {
          var msg = attr.ngConfirmClick || "Are you sure?";
          var clickAction = attr.confirmedClick;
          element.bind('click', function(event) {
            if (window.confirm(msg)) {
              scope.$eval(clickAction)
            }
          });
        }
      };
    }])
    .controller('bmsElementObjectCtrl', ['$scope', function($scope) {

      $scope.isMenu = false;
      $scope.isCollapsed = true;

      $scope.showMenu = function() {
        $scope.isMenu = true;
      };

      $scope.hideMenu = function() {
        $scope.isMenu = false;
      };

      $scope.toggleCollapse = function() {
        $scope.isCollapsed = ! $scope.isCollapsed;
      };

      $scope.selected = false;

      $scope.$on('highlightObserver', function(event, b) {
        $scope.selected = b;
      });

    }])
    .controller('bmsObserverFormulaCtrl', ['$scope', 'bmsJsEditorService',
      function($scope, bmsJsEditorService) {

        $scope.isMenu = false;

        $scope.openJsEditor = function(fn, el) {
          var doc = {
            description: 'The trigger function will be called after every state change with its ' +
              '<i>origin</i> reference set to the graphical element that the observer is attached to ' +
              'and the <i>values</i> of the formulas. The <i>origin</i> is a jQuery selector element. ' +
              'Consult the <a href="http://api.jquery.com/" target="_blank">jQuery API</a> for more ' +
              'information regarding accessing or manipulating the <i>origin</i> ' +
              '(e.g. <a href="http://api.jquery.com/category/attributes/" target="_blank">set and get attributes</a>).' +
              'The <i>values</i> parameter contains the values of ' +
              'the defined formulas in an array, e.g. use <i>values[0]</i> to obtain the result of ' +
              'the first formula.',
            parameter: [{
              name: 'origin',
              description: 'The reference set to the graphical element that the observer is attached to.'
            }, {
              name: 'values',
              description: 'Contains the values of the defined formulas in an array, e.g. use <i>values[0]</i> to obtain the result of the first formula.'
            }]
          };
          bmsJsEditorService.openJsEditor(fn, el, doc);
        };

        $scope.showMenu = function() {
          $scope.isMenu = true;
        };

        $scope.hideMenu = function() {
          $scope.isMenu = false;
        };

        $scope.addFormula = function() {
          $scope.observer.data.formulas.push("");
        };

        $scope.removeFormula = function(index) {
          $scope.observer.data.formulas.splice(index, 1);
        };

      }

    ])
    .
  controller('bmsExecuteEventCtrl', ['$scope', 'bmsJsEditorService', function($scope, bmsJsEditorService) {

      $scope.isMenu = false;

      $scope.openJsEditor = function(fn, el) {

        var doc = {
          description: 'The label function returns a custom label to be shown in the ' +
            'tooltip when hovering the graphical element that the execute event handler ' +
            'is attached to. You can also return an HTML element.',
          parameter: [{
            name: 'origin',
            description: 'The reference set to the graphical element that the execute ' +
              'event handler is attached to. The <i>origin</i> is a jQuery selector element. ' +
              'Consult the <a href="http://api.jquery.com/" target="_blank">jQuery API</a> for more ' +
              'information about accessing or manipulating the <i>origin</i>.'
          }, {
            name: 'event',
            description: 'An object containing the information of the respective event. ' +
              'Use <i>event.name</i> to obtain the name of the event and <i>event.predicate</i> ' +
              'to obtain the predicate of the event respectively.'
          }]
        };

        bmsJsEditorService.openJsEditor(fn, el, doc);

      };

      $scope.showMenu = function() {
        $scope.isMenu = true;
      };

      $scope.hideMenu = function() {
        $scope.isMenu = false;
      };

      $scope.addEvent = function() {
        $scope.event.data.events.push({
          name: "",
          predicate: ""
        });
      };

      $scope.removeEvent = function(index) {
        $scope.event.data.events.splice(index, 1);
      };

    }])
    .controller('bmsObserverCspEventCtrl', ['$scope', function($scope) {

      $scope.isObserverMenu = false;
      $scope.actionMenu = {};

      $scope.showObserverMenu = function() {
        $scope.isObserverMenu = true;
      };

      $scope.hideObserverMenu = function() {
        $scope.isObserverMenu = false;
      };

      $scope.isActionMenu = function(index) {
        return $scope.actionMenu[index] ? $scope.actionMenu[index] : false;
      };

      $scope.showActionMenu = function(index) {
        $scope.actionMenu[index] = true;
      };

      $scope.hideActionMenu = function(index) {
        $scope.actionMenu[index] = false;
      };

      $scope.addTransformer = function() {
        $scope.observer.data.observers.push({
          exp: "",
          actions: []
        });
      };

      $scope.addAction = function(o) {
        o['actions'].push({
          selector: "",
          attr: "",
          value: ""
        });
      };

      $scope.removeTransformer = function(index) {
        $scope.observer.data.observers.splice(index, 1);
      };

      $scope.removeAction = function(o, index) {
        o['actions'].splice(index, 1);
      };

    }])
    .controller('bmsObserverViewCtrl', ['$scope', 'bmsEditorCommonService', 'bmsParentService', '$rootScope',
      function($scope, bmsEditorCommonService, bmsParentService, $rootScope) {

        bmsEditorCommonService.isInitialised.promise.then(function() {
          var tool = bmsEditorCommonService.getVisualization()['manifest']['tool'];
          $scope.dynamicPopover = {
            templateUrl: 'observerMenu' + tool + 'Template.html'
          };
        });

        $scope.getIncludeFile = function(type) {
          return 'templates/bms-' + type + '-observer.html';
        };

        $scope.removeObserver = function(index) {
          bmsParentService.openDialog("Do you really want to delete this observer?", function(response) {
            if (response === 0) {
              $rootScope.$apply(function() {
                $scope.data.splice(index, 1);
              });
            }
          });
        };

        $scope.addFormulaObserver = function() {
          bmsParentService.addObserver("formula", {
            selector: "",
            trigger: ""
          });
        };

        $scope.addPredicateObserver = function() {
          bmsParentService.addObserver("predicate", {
            selector: ""
          });
        };

        $scope.addCSPEventObserver = function() {
          bmsParentService.addObserver("csp-event", {
            selector: "",
            observers: []
          });
        };

        $scope.toggleCollapseObserver = function(index) {
          console.log(index);
        };

        $scope.duplicateObserver = function(index) {
          var newObject = $.extend(true, {}, $scope.data[index]);
          $scope.data.push(newObject);
        };

        $scope.showJson = function() {
          console.log($scope.data);
        };

        bmsEditorCommonService.isInitialised.promise.then(function() {
          $scope.data = bmsEditorCommonService.getVisualization()['observers']['json'];
        });

      }
    ])
    .controller('bmsEventsViewCtrl', ['$scope', 'bmsEditorCommonService', 'bmsParentService', '$rootScope',
      function($scope, bmsEditorCommonService, bmsParentService, $rootScope) {

        $scope.dynamicPopover = {
          templateUrl: 'eventsMenuTemplate.html'
        };

        $scope.getIncludeFile = function(type) {
          return 'templates/bms-' + type + '-event.html';
        };

        $scope.removeEvent = function(index) {
          bmsParentService.openDialog("Do you really want to delete this event?", function(response) {
            if (response === 0) {
              $rootScope.$apply(function() {
                $scope.data.splice(index, 1);
              });
            }
          });
        };

        $scope.addExecuteEventEvent = function() {
          bmsParentService.addEvent("executeEvent", {
            selector: "",
            events: []
          });
        };

        $scope.duplicateEvent = function(index) {
          var newObject = $.extend(true, {}, $scope.data[index]);
          $scope.data.push(newObject);
        };

        bmsEditorCommonService.isInitialised.promise.then(function() {
          $scope.data = bmsEditorCommonService.getVisualization()['events']['json'];
        });

      }
    ])
    .controller('bmsEditorCtrl', ['$scope', 'bmsParentService', 'bmsEditorCommonService', '$http', '$parentScope',
      function($scope, bmsParentService, bmsEditorCommonService, $http, $parentScope) {

        var self = this;
        bmsParentService.init().then(function(obj) {

          self.visualization = obj.vis;
          self.svgFile = obj.svgFile;
          self.svgRootId = $(obj.svgContent).attr('id');

          bmsEditorCommonService.setVisualization(obj.vis);

          methodDraw.setVisualization(self.visualization);
          methodDraw.setSvgRootId(self.svgRootId);
          if (obj.svgContent) methodDraw.loadFromString(obj.svgContent);
          bmsEditorCommonService.isInitialised.resolve();

        }, function(error) {
          bmsParentService.bmsModalService.openErrorDialog("An error occurred while initialising editor: " + error);
          bmsParentService.disableEditor("An error occurred while initialising editor: " + error);
        });

        self.save = function() {
          // remove the selected outline before serializing
          svgCanvas.clearSelection();
          var svgContent = svgCanvas.getSvgString();
          // Save svg
          bmsParentService.save(svgContent);
        };

        $parentScope.$on('saveVisualization', function(evt, svg) {
          if (self.svg === svg) self.save();
        });

      }
    ]);

  return angularAMD.bootstrap(module);

});
