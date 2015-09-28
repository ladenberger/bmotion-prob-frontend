/**
 * BMotion Studio for ProB Editor Module
 *
 */
define(['prob.modal', 'bms.common'], function () {

    var module = angular.module('prob.iframe.editor', ['prob.modal', 'bms.common'])
        .factory('fs', function () {
            return require('fs');
        })
        .directive('bmsVisualisationEditor', ['bmsVisualizationService', 'bmsModalService', 'bmsMainService', '$q', '$http', 'fs', '$rootScope', function (bmsVisualizationService, bmsModalService, bmsMainService, $q, $http, fs, $rootScope) {
            return {
                replace: false,
                scope: {
                    svg: '@bmsSvgFile',
                    id: '@bmsVisualisationId',
                    sessionId: '@bmsVisualisationEditor'
                },
                template: '<iframe src="editor.html" class="editorIframe"></iframe>',
                controller: ['$scope', '$rootScope', function ($scope, $rootScope) {

                    $scope.init = function () {

                        var defer = $q.defer();

                        var vis = bmsVisualizationService.getVisualization($scope.id);
                        if (vis) {
                            $http.get(vis.templateFolder + '/' + $scope.svg).success(function (svg) {
                                defer.resolve({
                                    svg: $scope.svg,
                                    content: svg,
                                    vis: vis
                                });
                            }).error(function (error) {
                                bmsModalService.setError("Some error occurred while requesting file " + $scope.svg);
                                defer.reject();
                            });
                        } else {
                            bmsModalService.setError("No visualisation found with id " + $scope.id);
                        }

                        return defer.promise;

                    };

                    $scope.save = function (svg) {

                        var vis = bmsVisualizationService.getVisualization($scope.id);
                        if (vis) {
                            fs.writeFile(vis.templateFolder + '/' + $scope.svg, svg, function (err) {
                                if (err) bmsModalService.setError(err);
                                $rootScope.$broadcast('visualizationSaved');

                            });
                        } else {
                            bmsModalService.setError("No visualisation found with id " + $scope.id);
                        }

                    };

                }],
                link: function ($scope, $element, attrs, ctrl) {
                }
            }
        }]);

    return module;

});
