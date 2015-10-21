/**
 * BMotion Studio for ProB Standalone Module
 *
 */
define(['angularAMD', 'angular', 'prob.graph', 'prob.iframe.template', 'prob.ui', 'bms.manifest', 'prob.modal', 'bms.common', 'angular-route'],
    function (angularAMD, angular) {

        var module = angular.module('prob.online', ['prob.graph', 'prob.iframe.template', 'prob.ui', 'prob.modal', 'bms.manifest', 'bms.common', 'ngRoute'])
            .run(['editableOptions', 'bmsMainService',
                function (editableOptions, bmsMainService) {
                    bmsMainService.mode = 'ModeOnline';
                    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
                }])
            .config(['$routeProvider', '$locationProvider',
                function ($routeProvider) {
                    $routeProvider
                        .when('/', {
                            templateUrl: 'resources/templates/bms-online-ui.html',
                            controller: 'bmsOnlineHomeCtrl'
                        })
                        .when('/:sessionId/:view', {
                            templateUrl: 'resources/templates/bms-online-view.html',
                            controller: 'bmsOnlineVisualizationCtrl'
                        })
                        .otherwise({
                            redirectTo: '/'
                        });
                }])
            .controller('bmsOnlineHomeCtrl', ['$scope', 'initVisualizationService', '$routeParams',
                function ($scope, initVisualizationService, $routeParams) {
                    var path = $routeParams['path'];
                    if (path) {
                        initVisualizationService(path);
                    }
                    /*else {
                     bmsModalService.setMessage("Please provide path to bmotion.json file.<br/>Append \"\?path=[relative path to bmotion.json file]\" to URL.");
                     }*/
                }])
            .controller('bmsOnlineVisualizationCtrl', ['$scope',
                function ($scope) {
                }])
            .controller('bmsVisualizationCtrl', ['$scope', '$routeParams',
                function ($scope, $routeParams) {
                    var self = this;
                    self.view = $routeParams.view;
                    self.sessionId = $routeParams.sessionId;
                }])
            .directive('bmsVisualization', ['initVisualizationService',
                function (initVisualizationService) {
                    return {
                        replace: true,
                        scope: {},
                        template: '<div ng-view class="fullWidthHeight"></div>',
                        controller: ['$scope', function ($scope) {
                        }],
                        link: function ($scope, element, attrs, ctrl) {
                            var path = attrs['bmsVisualization'];
                            if (path) {
                                initVisualizationService(path);
                            } else {
                                bmsModalService.setMessage("Please provide path to bmotion.json file.");
                            }
                        }
                    }
                }])
            .factory('initVisualizationService', ['$location', 'bmsInitSessionService', 'bmsManifestService', 'bmsMainService', 'bmsModalService',
                function ($location, bmsInitSessionService, bmsManifestService, bmsMainService, bmsModalService) {

                    return function (manifestFilePath) {

                        bmsModalService.loading("Initialising visualisation ...");

                        bmsManifestService.validate(manifestFilePath)
                            .then(function (manifestData) {
                                bmsInitSessionService(manifestFilePath, manifestData)
                                    .then(function (sessionId) {
                                        // TODO: Handle multiple views in online mode!
                                        var views = manifestData.views;
                                        var view = views[0];
                                        $location.path('/' + sessionId + '/' + view.id);
                                        bmsModalService.endLoading();
                                    }, function (errors) {
                                        bmsModalService.openErrorDialog(errors);
                                    });
                            }, function (error) {
                                bmsModalService.openErrorDialog(error);
                            });

                    }

                }]);
        return angularAMD.bootstrap(module);

    })
;