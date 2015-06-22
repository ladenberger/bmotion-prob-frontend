/**
 * BMotion Studio for ProB Editor Module
 *
 */
define(['prob.modal'], function () {

    var module = angular.module('prob.iframe.editor', ['prob.modal'])
        .directive('bmsVisualisationEditor', ['bmsVisualisationService', 'bmsModalService', function (bmsVisualisationService, bmsModalService) {
            return {
                replace: false,
                scope: {
                    svgId: '@bmsSvgId',
                    visualisationId: '@bmsVisualisationId'
                },
                template: '<iframe src="../resources/editor/index.html"></iframe>',
                controller: ['$scope', function ($scope) {

                    var self = this;

                    $scope.getSvg = function () {
                        var vis = bmsVisualisationService.getVisualisation(self.visualisationId);
                        if (vis) {
                            var svgList = vis['svg'];
                            var svg = svgList[self.svgId];
                            if (svg) {
                                return svg;
                            } else {
                                bmsModalService.setError("No svg data found with id " + self.svgId);
                            }
                        } else {
                            bmsModalService.setError("No visualisation found with id " + self.visualisationId);
                        }
                    };

                }],
                link: function ($scope, $element, attrs, ctrl) {
                }
            }
        }]);

    return module;

});
