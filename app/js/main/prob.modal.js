/**
 * BMotion Studio for ProB Modal Module
 *
 */
define(['ui-bootstrap', 'ui-bootstrap-tpls'], function () {

    var module = angular.module('prob.modal', ['ui.bootstrap'])
        .controller('bmsLoadingModalInstanceCtrl', ['$scope', '$modalInstance', '$q', 'bmsModalService', function ($scope, $modalInstance, $q, bmsModalService) {

            $scope.message = "";
            $scope.state = bmsModalService.states.default;
            $scope.dialog = false;

            $scope.close = function () {
                $modalInstance.close();
                bmsModalService.currentModalInstance = null;
            };

            $scope.ok = function () {
                bmsModalService.modaDialogDeferred.resolve();
                $scope.close();
            };

            $scope.cancel = function () {
                bmsModalService.modaDialogDeferred.reject();
                $scope.close();
            };

            $modalInstance.setDialog = function (d) {
                $scope.dialog = d;
            };

            $modalInstance.setMessage = function (msg, s) {
                $scope.message = msg;
                $scope.state = s ? s : $scope.state;
            };

        }])
        .service('bmsModalService', ['$rootScope', '$q', '$modal', function ($rootScope, $q, $modal) {

            var self = this;

            self.currentModalInstance = null;

            self.states = {
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

            self.isOpen = false;

            self.createModal = function () {

                var modalInstance = $modal.open({
                    template: '<div class="modal-header" style="height:40px;">'
                    + '<button type="button" class="close" data-dismiss="modal" ng-click="close()">'
                    + '<span aria-hidden="true">&times;</span><span class="sr-only">Close</span>'
                    + '</button>'
                    + '</div>'
                    + '<div class="modal-body">'
                    + '<p class="bmotion-img-logo"></p>'
                    + '<p ng-attr-class="{{state.icon}}"></p>'
                    + '<div ng-if="message">'
                    + '<div class="bmotion-alert alert {{state.class}}" role="alert">{{message}}</div>'
                    + '<div class="modal-footer" ng-show="dialog">'
                    + '<button class="btn" type="button" ng-click="ok()">OK</button>'
                    + '<button class="btn" type="button" ng-click="cancel()">Cancel</button>'
                    + '</div>'
                    + '</div>',
                    controller: 'bmsLoadingModalInstanceCtrl',
                    backdrop: false
                });

                return modalInstance;

            };

            self.getModal = function () {

                var defer = $q.defer();

                if (self.currentModalInstance === null) self.currentModalInstance = self.createModal();
                self.currentModalInstance.opened.then(function () {
                    defer.resolve(self.currentModalInstance);
                });

                return defer.promise;

            };

            self.reset = function () {
                self.hideDialog();
                self.removeMessage();
            };

            self.hideDialog = function () {
                if (self.currentModalInstance !== null) self.currentModalInstance.setDialog(false);
            };

            self.removeMessage = function () {
                if (self.currentModalInstance !== null) self.currentModalInstance.setMessage("");
            };

            self.setDialog = function (b) {
                if (self.currentModalInstance !== null) self.currentModalInstance.setDialog(b);
            };

            self.setMessage = function (msg, s) {
                if (msg.length > 0) {
                    self.getModal().then(function (m) {
                        m.setMessage(msg, s);
                    });
                }
            };

            self.setDefault = function (msg) {
                self.setMessage(msg, self.states.default);
            };

            self.setError = function (msg) {
                self.setMessage(msg, self.states.error);
            };

            self.openErrorDialog = function (msg) {
                return self.openDialog(msg, self.states.error);
            };

            self.openDialog = function (msg, s) {

                self.modaDialogDeferred = $q.defer();
                if (msg.length > 0) {
                    self.getModal().then(function () {
                        self.setMessage(msg, s ? s : self.states.default);
                        self.setDialog(true);
                    });
                } else {
                    self.modaDialogDeferred.resolve();
                }
                return self.modaDialogDeferred.promise;

            };

            self.loading = function (msg) {
                self.setMessage(msg, self.states.loading)
            };

            self.endLoading = function () {
                self.reset();
                self.closeModal();
            };

            self.closeModal = function () {
                if (self.currentModalInstance !== null) {
                    self.currentModalInstance.close();
                    self.currentModalInstance = null;
                }
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