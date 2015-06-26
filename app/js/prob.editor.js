/**
 * BMotion Studio for ProB Editor Iframe Module
 *
 */
define(['angularAMD', 'angular', 'jquery', 'jquery.contextMenu', 'jquery.jgraduate', 'jpicker',
    'jquery.bbq', 'jquery.hotkeys', 'jquery.draginput', 'mousewheel',
    'taphold', 'touch', 'requestanimationframe',
    'svgtransformlist', 'method-draw', 'angular-json-editor',
    'prob.modal', 'bms.visualization'], function (angularAMD) {

    var module = angular.module('prob.editor', ['prob.modal', 'bms.visualization', 'angular-json-editor'])
        .factory('$parentScope', ['$window', function ($window) {
            return $window.parent.angular.element($window.frameElement).scope();
        }])
        .service('bmsParentService', ['$parentScope', function ($parentScope) {
            var observerService = {
                init: function () {
                    return $parentScope.init();
                },
                save: function (svg) {
                    $parentScope.save(svg);
                }
            };
            return observerService;
        }])
        .controller('bmsEditorCtrl', ['$scope', 'bmsParentService', 'bmsModalService', '$http', 'bmsVisualizationService', '$parentScope', function ($scope, bmsParentService, bmsModalService, $http, bmsVisualizationService, $parentScope) {

            var self = this;
            bmsParentService.init().then(function (obj) {
                methodDraw.setVisualization(obj.vis);
                self.svg = obj.svg;
                if (obj.content) methodDraw.loadFromString(obj.content);
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
