/**
 * BMotion Studio for ProB Modal Module
 *
 */
define(['bmotion.func', 'ui-bootstrap', 'ui-bootstrap-tpls'], function (prob) {

    var module = angular.module('prob.modal', ['ui.bootstrap'])
        .controller('bmsLoadingModalCtrl', ['$scope', '$modal', function ($scope, $modal) {

            var modalInstance = null;

            $scope.open = function () {
                modalInstance = $modal.open({
                    templateUrl: 'bmsLoadingModal.html',
                    controller: 'bmsLoadingModalInstanceCtrl'
                });
                modalInstance.opened.then(function () {
                    modalInstance.isOpen = true;
                });
            };

            $scope.close = function () {
                if (modalInstance) {
                    modalInstance.close();
                    modalInstance.isOpen = false;
                }
            };

            $scope.$on('openModal', function () {
                $scope.open();
            });

            $scope.$on('closeModal', function () {
                $scope.close();
            });

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
                if (modalInstance) {
                    if (!modalInstance.isOpen) {
                        $scope.open();
                    }
                    modalInstance.opened.then(function () {
                        modalInstance.setError(error);
                    });
                }
            });

        }
        ])
        .
        controller('bmsLoadingModalInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

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