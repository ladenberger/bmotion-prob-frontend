
/**
 * BMotion Studio for ProB Editor Iframe Module
 *
 */
define(['angularAMD', 'angular', 'jquery', 'jquery.contextMenu', 'jquery.jgraduate', 'jpicker',
    'jquery.bbq', 'jquery.hotkeys', 'jquery.draginput', 'mousewheel',
    'taphold', 'touch', 'requestanimationframe',
    'svgtransformlist', 'method-draw'], function (angularAMD) {

    var module = angular.module('prob.editor', [])
        .factory('$parentScope', ['$window', function ($window) {
            return $window.parent.angular.element($window.frameElement).scope();
        }])
        .service('bmsParentService', ['$parentScope', function ($parentScope) {
            var observerService = {
                getSvg: function () {
                    return $parentScope.getSvg();
                }
            };
            return observerService;
        }])
        .controller('bmsEditorCtrl', ['$scope', 'bmsParentService', function ($scope, bmsParentService) {
            var svg = bmsParentService.getSvg();
            if (svg) methodDraw.loadFromString(svg);
        }]);

    return angularAMD.bootstrap(module);

});
