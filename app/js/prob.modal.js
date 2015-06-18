/**
 * BMotion Studio for ProB Modal Module
 *
 */
define(['ui-bootstrap', 'ui-bootstrap-tpls'], function () {

    var module = angular.module('prob.modal', ['ui.bootstrap'])
        .controller('bmsLoadingModalCtrl', ['$scope', '$modal', 'bmsModalService', function ($scope, $modal, bmsModalService) {

            var self = this;

            var modalInstance = null;

            self.message = bmsModalService.getMessage();
            self.isOpen = false;

            self.open = function (msg) {

                if (!modalInstance || (modalInstance && !self.isOpen)) {

                    modalInstance = $modal.open({
                        template: '<div class="modal-header" style="height:40px;">'
                        + '<button type="button" class="close" data-dismiss="modal" ng-click="close()">'
                        + '<span aria-hidden="true">&times;</span><span class="sr-only">Close</span>'
                        + '</button>'
                        + '</div>'
                        + '<div class="modal-body">'
                        + '<p class="bmotion-img-logo"></p>'
                        + '<p ng-attr-class="{{message.state.icon}}"></p>'
                        + '<div ng-if="message">'
                        + '<div class="bmotion-alert alert {{message.state.class}}" role="alert">{{message.text}}</div>'
                        + '</div>',
                        controller: 'bmsLoadingModalInstanceCtrl',
                        resolve: {
                            data: function () {
                                return {
                                    getMessage: function () {
                                        return self.message;
                                    }
                                }
                            }
                        }
                    });
                    modalInstance.opened.then(function () {
                        self.isOpen = true;
                    });
                    modalInstance.result.then(function () {
                        self.isOpen = false;
                    });

                } else {
                    modalInstance.opened.then(function () {
                        modalInstance.setMessage(msg)
                    });
                }

            };

            self.close = function () {
                if (modalInstance) {
                    modalInstance.close();
                    modalInstance = null;
                }
            };

            $scope.$watch(function () {
                return bmsModalService.getMessage()
            }, function (msg) {
                self.message = msg;
                if (msg.text.length > 0) self.open(msg);
            });

        }])
        .controller('bmsLoadingModalInstanceCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

            $scope.message = data.getMessage();
            $scope.close = function () {
                $modalInstance.close();
            };
            $modalInstance.setMessage = function (msg) {
                $scope.message = msg;
            };

        }])
        .service('bmsModalService', ['$rootScope', function ($rootScope) {

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
                },
                message = {text: "", state: states.default};

            this.reset = function () {
                this.setMessage("", states.default);
            };

            this.setMessage = function (msg, s) {
                var tmp = {text: msg, state: s ? s : message.state};
                if ($rootScope.$root.$$phase != '$apply' && $rootScope.$root.$$phase != '$digest') {
                    $rootScope.$apply(function () {
                        message = tmp;
                    });
                }
                else {
                    message = tmp;
                }
            };

            this.getMessage = function () {
                return message;
            };

            this.setError = function (msg) {
                this.setMessage(msg, states.error);
            };

            this.startLoading = function (msg) {
                this.setMessage(msg, states.loading)
            };

            this.endLoading = function () {
                this.reset();
                this.closeModal();
            };

        }])
        .controller('bmsEditorModalCtrl', ['$scope', '$modal', function ($scope, $modal) {

            var modalInstance = null;

            //$scope.isOpen = false;

            $scope.open = function (visualisationId, svgId) {
                modalInstance = $modal.open({
                    windowClass: 'full-screen bms-editor',
                    animation: false,
                    template: '<div class="modal-header">'
                    + '<div class="buttons">'
                    + '<button type="button" data-dismiss="modal" ng-click="close()">'
                    + '<span class="glyphicon glyphicon-remove"></span>'
                    + '</button>'
                    + '</div>'
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

        }])
        .controller('bmsElementProjectionModalCtrl', ['$scope', '$modal', function ($scope, $modal) {

            var modalInstance = null;

            $scope.open = function () {
                modalInstance = $modal.open({
                    windowClass: 'full-screen',
                    animation: false,
                    template: '<div class="modal-header">'
                    + '<div class="buttons">'
                    + '<button type="button" data-dismiss="modal" ng-click="close()">'
                    + '<span class="glyphicon glyphicon-remove"></span>'
                    + '</button>'
                    + '<button type="button" ng-click="export()">'
                    + '<span class="glyphicon glyphicon-export"></span>'
                    + '</button>'
                    + '</div>'
                    + '</div>'
                    + '<div class="modal-body">'
                    + '<div data-bms-diagram-element-projection-view class="fullWidthHeight"></div>'
                    + '</div>',
                    controller: 'bmsElementProjectionInstanceCtrl'
                });
            };

            $scope.close = function () {
                modalInstance.close();
            };

            $scope.$on('openElementProjectionModal', function (evt) {
                $scope.open();
            });

        }])
        .controller('bmsElementProjectionInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

            $scope.close = function () {
                $modalInstance.close();
            };

            $scope.export = function () {
                $scope.$broadcast('exportSvg');
            };

        }])
        .controller('bmsTraceDiagramModalCtrl', ['$scope', '$modal', function ($scope, $modal) {

            var modalInstance = null;

            $scope.open = function () {
                modalInstance = $modal.open({
                    windowClass: 'full-screen',
                    animation: false,
                    template: '<div class="modal-header">'
                    + '<div class="buttons">'
                    + '<button type="button" data-dismiss="modal" ng-click="close()">'
                    + '<span class="glyphicon glyphicon-remove"></span>'
                    + '</button>'
                    + '<button type="button" ng-click="export()">'
                    + '<span class="glyphicon glyphicon-export"></span>'
                    + '</button>'
                    + '</div>'
                    + '</div>'
                    + '<div class="modal-body">'
                    + '<div bms-diagram-trace-view class="fullWidthHeight"></div>'
                    + '</div>',
                    controller: 'bmsTraceDiagramInstanceCtrl'
                });
            };

            $scope.close = function () {
                modalInstance.close();
            };

            $scope.$on('openTraceDiagramModal', function () {
                $scope.open();
            });

        }])
        .controller('bmsTraceDiagramInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

            $scope.close = function () {
                $modalInstance.close();
            };

            $scope.export = function () {
                $scope.$broadcast('exportSvg');
            };

        }]);

    return module;

})
;