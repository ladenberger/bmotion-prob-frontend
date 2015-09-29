/**
 * BMotion Studio for ProB Editor Iframe Module
 *
 */
define(['angularAMD', 'angular', 'jquery.jgraduate', 'jpicker',
    'jquery.draginput', 'mousewheel', 'taphold', 'requestanimationframe',
    'method-draw'], function (angularAMD) {

    var module = angular.module('prob.editor', [])
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
        .controller('bmsEditorCtrl', ['$scope', 'bmsParentService', '$http', '$parentScope', function ($scope, bmsParentService, $http, $parentScope) {

            var self = this;
            bmsParentService.init().then(function (obj) {
                methodDraw.setVisualization(obj.vis);
                methodDraw.setSvgRootId(obj.rootId);
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
