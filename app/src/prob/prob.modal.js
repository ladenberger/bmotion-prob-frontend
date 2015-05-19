/**
 * BMotion Studio for ProB Modal Module
 *
 */
define(['ui-bootstrap', 'ui-bootstrap-tpls'], function () {

    var module = angular.module('prob.modal', ['ui.bootstrap'])
        .controller('bmsLoadingModalCtrl', ['$scope', '$modal', function ($scope, $modal) {

            var modalInstance = null;

            $scope.open = function () {
                modalInstance = $modal.open({
                    template: '<div class="modal-header" style="height:40px;">'
                    + '<button type="button" class="close" data-dismiss="modal" ng-click="close()">'
                    + '<span aria-hidden="true">&times;</span><span class="sr-only">Close</span>'
                    + '</button>'
                    + '</div>'
                    + '<div class="modal-body">'
                    + '<p class="bmotion-img-logo"></p>'
                    + '<p ng-attr-class="{{icon}}"></p>'
                    + '<div ng-if="msg">'
                    + '<div class="bmotion-alert alert alert-danger" role="alert">{{msg}}</div>'
                    + '</div>'
                    + '</div>',
                    controller: 'bmsLoadingModalInstanceCtrl'
                });
                modalInstance.opened.then(function () {
                    modalInstance.isOpen = true;
                });
            };

            $scope.$on('openModal', function () {
                $scope.open();
            });

            $scope.$on('closeModal', function () {
                $scope.close();
            });

            $scope.close = function () {
                modalInstance.close();
            };

            $scope.$on('startLoading', function () {
                $scope.open();
                modalInstance.opened.then(function () {
                    modalInstance.startLoading();
                });
            });

            $scope.$on('endLoading', function () {
                $scope.close();
            });

            $scope.$on('setError', function (evt, error) {
                if (!modalInstance || (modalInstance && !modalInstance.isOpen)) {
                    $scope.open();
                }
                modalInstance.opened.then(function () {
                    modalInstance.setError(error);
                });
            });

        }])
        .controller('bmsLoadingModalInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

            $modalInstance.isOpen = false;
            $scope.icon = "";
            $scope.msg = "";

            $modalInstance.setError = function (error) {
                if (Object.prototype.toString.call(error) === '[object Array]') {
                    $scope.msg = error.join();
                } else {
                    $scope.msg = error
                }
                $scope.icon = 'bmotion-img-error';
            };

            $modalInstance.startLoading = function () {
                $scope.icon = 'bmotion-img-loader';
            };

            $scope.close = function () {
                $modalInstance.dismiss('cancel');
                $modalInstance.isOpen = false;
            };

            $scope.$on('modal.closing', function () {
                $modalInstance.isOpen = false;
            });

        }])
        .factory('bmsModalService', ['$rootScope', function ($rootScope) {

            return {
                openModal: function () {
                    $rootScope.$broadcast('openModal');
                },
                closeModal: function () {
                    $rootScope.$broadcast('closeModal');
                },
                startLoading: function () {
                    $rootScope.$broadcast('startLoading');
                },
                endLoading: function () {
                    $rootScope.$broadcast('endLoading');
                },
                setError: function (error) {
                    $rootScope.$broadcast('setError', error);
                }
            }

        }]);

    return module;

})
;