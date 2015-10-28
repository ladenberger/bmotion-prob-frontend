/**
 * BMotion Studio Node Webkit Module
 *
 */
define(['angular'], function (angular) {

    var module = angular.module('bms.electron', [])
        .factory('electronRemote', function () {
            return require('remote');
        })
        .factory('electronWindow', ['electronRemote', function (electronRemote) {
            return electronRemote.require('browser-window');
        }])
        .factory('electronDialog', ['electronRemote', function (electronRemote) {
            return electronRemote.require('dialog');
        }])
        .factory('electronWindowService', ['electronWindow', function (electronWindow) {
            var factory = {
                createNewWindow: function () {
                    return new electronWindow({
                        height: 600,
                        width: 800,
                        title: 'BMotion Studio for ProB',
                        icon: __dirname + '/resources/icons/bmsicon16x16.png'
                    });
                }
            };
            return factory;
        }]);

    return module;

});