/**
 * BMotion Studio for ProB Editor Module
 *
 */
define(['prob.modal'], function () {

    var module = angular.module('prob.editor', ['prob.modal'])
        .directive('bmsVisualisationEditor', ['bmsVisualisationService', 'bmsModalService', function (bmsVisualisationService, bmsModalService) {
            return {
                replace: false,
                scope: {
                    svgId: '@bmsSvgId',
                    visualisationId: '@bmsVisualisationId'
                },
                template: '<iframe src="../../app/editor/index.html"></iframe>',
                controller: ['$scope', function ($scope) {

                    //var self = this;

                    $scope.getSvg = function () {
                        var vis = bmsVisualisationService.getVisualisation(this.visualisationId);
                        if (vis) {
                            var svgList = vis['svg'];
                            var svg = svgList[this.svgId];
                            if (svg) {
                                return svg;
                            } else {
                                bmsModalService.setError("No svg data found with id " + this.svgId);
                            }
                        } else {
                            bmsModalService.setError("No visualisation found with id " + this.visualisationId);
                        }
                    };

                }],
                link: function ($scope, $element, attrs, ctrl) {
                }
            }
        }]);

    return module;

});
