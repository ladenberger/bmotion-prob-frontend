/**
 * BMotion Studio for ProB Modal Module
 *
 */
define(['ui-bootstrap', 'ui-bootstrap-tpls'], function () {

    var module = angular.module('prob.modal', ['ui.bootstrap'])
        .controller('bmsLoadingModalCtrl', ['$scope', '$modal', function ($scope, $modal) {

            var modalInstance = null;

            var states = {
                error: {
                    class: 'alert-danger',
                    icon: 'bmotion-img-error'
                },
                loading: {
                    class: 'alert-info',
                    icon: 'bmotion-img-loader'
                },
                default: {
                    class: 'alert-info',
                    icon: ''
                }
            };

            $scope.msg = "";
            $scope.state = states.default;
            $scope.isOpen = false;

            $scope.open = function (msg, state) {

                if (Object.prototype.toString.call(msg) === '[object Array]') {
                    $scope.msg = msg.join();
                } else {
                    $scope.msg = msg
                }

                $scope.state = state ? state : states.default;

                if (!modalInstance || (modalInstance && !$scope.isOpen)) {

                    modalInstance = $modal.open({
                        template: '<div class="modal-header" style="height:40px;">'
                        + '<button type="button" class="close" data-dismiss="modal" ng-click="close()">'
                        + '<span aria-hidden="true">&times;</span><span class="sr-only">Close</span>'
                        + '</button>'
                        + '</div>'
                        + '<div class="modal-body">'
                        + '<p class="bmotion-img-logo"></p>'
                        + '<p ng-attr-class="{{state.icon}}"></p>'
                        + '<div ng-if="msg">'
                        + '<div class="bmotion-alert alert {{state.class}}" role="alert">{{msg}}</div>'
                        + '</div>',
                        controller: 'bmsLoadingModalInstanceCtrl',
                        resolve: {
                            data: function () {
                                return {
                                    getMessage: function () {
                                        return $scope.msg;
                                    },
                                    getState: function () {
                                        return $scope.state;
                                    }
                                }
                            }
                        }
                    });
                    modalInstance.opened.then(function () {
                        $scope.isOpen = true;
                    });
                    modalInstance.result.then(function () {
                        $scope.isOpen = false;
                    });

                } else {
                    modalInstance.opened.then(function () {
                        modalInstance.setMessage($scope.msg);
                    });
                }

            };

            $scope.close = function () {
                modalInstance.close();
            };

            $scope.setMessage = function (msg, state) {
                $scope.open(msg, state);
            };

            $scope.$on('openModal', function (evt, msg) {
                $scope.open(msg);
            });

            $scope.$on('closeModal', function () {
                $scope.close();
            });

            $scope.$on('startLoading', function (evt, msg) {
                $scope.open(msg, states.loading);
            });

            $scope.$on('setModalMessage', function (evt, msg, state) {
                $scope.setMessage(msg, state);
            });

            $scope.$on('setErrorMessage', function (evt, msg) {
                $scope.setMessage(msg, states.error);
            });

        }])
        .controller('bmsLoadingModalInstanceCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

            $scope.msg = data.getMessage();
            $scope.state = data.getState();
            $scope.close = function () {
                $modalInstance.close();
            };
            $modalInstance.setMessage = function (msg) {
                $scope.msg = msg;
            };
            /*$scope.$on('modal.closing', function () {
             $scope.isOpen = false;
             });*/

        }])
        .factory('bmsModalService', ['$rootScope', function ($rootScope) {

            var modalService = {
                openModal: function () {
                    $rootScope.$broadcast('openModal');
                },
                closeModal: function () {
                    $rootScope.$broadcast('closeModal');
                },
                setMessage: function (msg, state) {
                    $rootScope.$broadcast('setModalMessage', msg, state);
                },
                setError: function (msg) {
                    $rootScope.$broadcast('setErrorMessage', msg);
                },
                startLoading: function (msg) {
                    $rootScope.$broadcast('startLoading', msg);
                },
                endLoading: function () {
                    $rootScope.$broadcast('closeModal');
                }
            };

            return modalService;

        }])
        .controller('bmsEditorModalCtrl', ['$scope', '$modal', function ($scope, $modal) {

            var modalInstance = null;

            //$scope.isOpen = false;

            $scope.open = function (visualisationId, svgId) {
                modalInstance = $modal.open({
                    windowClass: 'full-screen',
                    animation: false,
                    template: '<div class="modal-header">'
                    + '<button type="button" class="close" data-dismiss="modal" ng-click="close()">'
                    + '<span aria-hidden="true">&times;</span><span class="sr-only">Close</span>'
                    + '</button>'
                    + '</div>'
                    + '<div class="modal-body">'
                    + '<div data-bms-visualisation-editor data-bms-visualisation-id="' + visualisationId + '" data-bms-svg-id="' + svgId + '" class="fullWidthHeight"></div>'
                    + '</div>',
                    controller: 'bmsEditorInstanceCtrl'
                });
                /*modalInstance.opened.then(function () {
                 $scope.isOpen = true;
                 });
                 modalInstance.result.then(function () {
                 $scope.isOpen = false;
                 });*/
            };

            $scope.close = function () {
                modalInstance.close();
            };

            $scope.$on('openEditorModal', function (evt, visualisationId, svgId) {
                $scope.open(visualisationId, svgId);
            });

            $scope.$on('closeEditorModal', function () {
                $scope.close();
            });

        }])
        .controller('bmsEditorInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

            $scope.close = function () {
                $modalInstance.close();
            };

        }]);

    return module;

})
;