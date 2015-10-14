/**
 * BMotion Studio for ProB Editor Iframe Module
 *
 */
define(['angularAMD', 'code-mirror!javascript', 'angular', 'jquery.jgraduate', 'jpicker',
    'jquery.draginput', 'mousewheel', 'taphold', 'requestanimationframe',
    'method-draw', 'angular-ui-codemirror', 'angular-xeditable', 'ui-bootstrap',
    'ui-bootstrap-tpls'], function (angularAMD, CodeMirror) {

    var module = angular.module('prob.editor', ['ui.codemirror', 'xeditable', 'ui.bootstrap'])
        .run(function (editableOptions, editableThemes) {
            window.CodeMirror = CodeMirror;
            editableOptions.theme = 'default';
            editableThemes['default'].submitTpl = '<button type="submit"><i class="fa fa-floppy-o"></i></button>';
            editableThemes['default'].cancelTpl = '<button type="button" ng-click="$form.$cancel()"><i class="fa fa-ban"></i></button>';
        })
        .factory('$parentScope', ['$window', function ($window) {
            return $window.parent.angular.element($window.frameElement).scope();
        }])
        .factory('bmsEditorCommonService', ['$q', function ($q) {

            var visualization;
            return {
                setVisualization: function (vis) {
                    visualization = vis;
                },
                getVisualization: function () {
                    return visualization;
                },
                isInitialised: $q.defer()
            }

        }])
        .factory('bmsParentService', ['$parentScope', function ($parentScope) {
            return {
                init: function () {
                    return $parentScope.init();
                },
                save: function (svg) {
                    $parentScope.save(svg);
                },
                addObserver: function (type, data) {
                    $parentScope.addObserver(type, data);
                }
            };
        }])
        .directive('ngConfirmClick', [function () {
            return {
                link: function (scope, element, attr) {
                    var msg = attr.ngConfirmClick || "Are you sure?";
                    var clickAction = attr.confirmedClick;
                    element.bind('click', function (event) {
                        if (window.confirm(msg)) {
                            scope.$eval(clickAction)
                        }
                    });
                }
            };
        }])
        .controller('bmsObserverObjectCtrl', ['$scope', function ($scope) {

            $scope.isObserverMenu = false;

            $scope.showObserverMenu = function () {
                $scope.isObserverMenu = true;
            };

            $scope.hideObserverMenu = function () {
                $scope.isObserverMenu = false;
            };

            $scope.selected = false;

            $scope.$on('highlightObserver', function (event, b) {
                $scope.selected = b;
            });

        }])
        .controller('bmsObserverFormulaCtrl', ['$scope', '$uibModal', '$timeout', function ($scope, $uibModal, $timeout) {

            $scope.addButtonsStatus = {};
            $scope.isFormulaMenu = false;
            var modalInstance;

            $scope.openJsEditor = function (fn, observer) {

                var code = observer.data[fn];

                $scope.$emit('highlightObserver', true);

                modalInstance = $uibModal.open({
                    template: '<div class="modal-js-editor">'
                    + '<div class="modal-header">'
                    + '<h3 class="modal-title">JavaScript Editor</h3>'
                    + '</div>'
                    + '<div class="modal-body">'
                    + '<div class="js-editor" ui-codemirror="editorOptions" ng-model="code"></div>'
                    + '<div class="modal-footer">'
                    + '<button class="btn" type="button" ng-click="ok()">OK</button>'
                    + '<button class="btn" type="button" ng-click="cancel()">Cancel</button>'
                    + '</div></div></div>',
                    controller: function ($scope, $modalInstance, code) {

                        $scope.code = code;

                        $modalInstance.setRefresh = function (b) {
                            $scope.refresh = b;
                        };

                        $scope.close = function () {
                            $modalInstance.close();
                        };

                        $scope.ok = function () {
                            $modalInstance.close($scope.code);
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };

                        $scope.codemirrorLoaded = function (_editor) {
                            $timeout(function () {
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
                        code: function () {
                            return code;
                        }
                    },
                    backdrop: false
                });
                modalInstance.result.then(function (code) {
                    $scope.code = code;
                    observer.data[fn] = code;
                    $scope.$emit('highlightObserver', false);
                }, function () {
                    $scope.$emit('highlightObserver', false);
                });
            };

            $scope.showFormulaMenu = function () {
                $scope.isFormulaMenu = true;
            };

            $scope.hideFormulaMenu = function () {
                $scope.isFormulaMenu = false;
            };

            $scope.addFormula = function () {
                $scope.observer.data.formulas.push("");
            };

            $scope.removeFormula = function (index) {
                $scope.observer.data.formulas.splice(index, 1);
                $scope.addButtonsStatus[index] = false;
            };

            $scope.showAddButtons = function (index) {
                $scope.addButtonsStatus[index] = true;
            };

            $scope.hideAddButtons = function (index) {
                $scope.addButtonsStatus[index] = false;
            };

        }])
        .controller('bmsObserverViewCtrl', ['$scope', 'bmsEditorCommonService', 'bmsParentService', function ($scope, bmsEditorCommonService, bmsParentService) {

            $scope.dynamicPopover = {
                templateUrl: 'observerMenuTemplate.html'
            };

            $scope.getIncludeFile = function (type) {
                return 'resources/templates/bms-' + type + '-observer.html';
            };

            $scope.removeObserver = function (index) {
                $scope.data.splice(index, 1);
            };

            $scope.addFormulaObserver = function () {
                bmsParentService.addObserver("formula", {
                    selector: "",
                    trigger: ""
                });
            };

            $scope.addPredicateObserver = function () {
                bmsParentService.addObserver("predicate", {selector: ""});
            };

            $scope.duplicateObserver = function (index) {
                var newObject = $.extend(true, {}, $scope.data[index]);
                $scope.data.push(newObject);
            };

            $scope.showJson = function () {
                console.log($scope.data);
            };

            bmsEditorCommonService.isInitialised.promise.then(function () {
                $scope.data = bmsEditorCommonService.getVisualization().observers.json;
            });

        }])
        .controller('bmsEditorCtrl', ['$scope', 'bmsParentService', 'bmsEditorCommonService', '$http', '$parentScope', function ($scope, bmsParentService, bmsEditorCommonService, $http, $parentScope) {

            var self = this;
            bmsParentService.init().then(function (obj) {
                bmsEditorCommonService.setVisualization(obj.vis);
                methodDraw.setVisualization(obj.vis);
                methodDraw.setSvgRootId(obj.rootId);
                self.svg = obj.svg;
                if (obj.content) methodDraw.loadFromString(obj.content);
                bmsEditorCommonService.isInitialised.resolve();
            });

            self.save = function () {
                // remove the selected outline before serializing
                svgCanvas.clearSelection();
                var svg = svgCanvas.getSvgString();
                if (svg) {
                    bmsParentService.save(svg);
                }
            };

            $parentScope.$on('saveVisualization', function (evt, svg) {
                if (self.svg === svg) self.save();
            });

        }]);

    return angularAMD.bootstrap(module);

});
