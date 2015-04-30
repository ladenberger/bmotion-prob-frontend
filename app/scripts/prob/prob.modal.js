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
            };

            $scope.close = function () {
                if (modalInstance) {
                    modalInstance.close();
                }
            };

            $scope.$on('startLoading', function () {
                $scope.open();
            });

            $scope.$on('endLoading', function () {
                $scope.close();
            });

        }])
        .controller('bmsLoadingModalInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

            $scope.close = function () {
                $modalInstance.close();
            };

        }])
        .factory('bmsModalService', ['$rootScope', function ($rootScope) {

            return {
                startLoading: function () {
                    $rootScope.$broadcast('startLoading');
                },
                endLoading: function () {
                    $rootScope.$broadcast('endLoading');
                }
            }

        }]);

    return module;

});