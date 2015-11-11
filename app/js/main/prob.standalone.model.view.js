/**
 * BMotion Studio for ProB Standalone Model View Module
 *
 */
define(['bms.session', 'prob.modal', 'bms.electron', 'ng-electron'], function () {

    var module = angular.module('prob.standalone.model.view', ['bms.session', 'prob.modal', 'bms.electron', 'ngElectron'])
        .controller('bmsModelViewCtrl', ['$scope', '$rootScope', '$location', '$routeParams', 'electron', 'loadServerData', 'bmsModalService',
            function ($scope, $rootScope, $location, $routeParams, electron, loadServerData, bmsModalService) {

                var self = this;
                self.sessionId = $routeParams.sessionId;
                self.win = parseInt($routeParams.win);
                self.tool = $routeParams.tool;

                $rootScope.$broadcast('closeDialog');

                electron.send({
                    type: "buildModelMenu",
                    win: self.win
                }, self.win);

                loadServerData(self.sessionId)
                    .then(function (serverData) {
                        $rootScope.$broadcast('setProBViewTraceId', serverData['traceId']);
                        $rootScope.$broadcast('openDialog_CurrentTrace');
                        $rootScope.$broadcast('openDialog_Events');
                    }, function (errors) {
                        bmsModalService.openErrorDialog(errors);
                    });

            }]);

    return module;

});