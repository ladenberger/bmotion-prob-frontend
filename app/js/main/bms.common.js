/**
 * BMotion Studio Common Module
 *
 */
define(['angular'], function () {

        return angular.module('bms.common', [])
            .factory('bmsMainService', [
                function () {
                    var main = {
                        mode: "ModeStandalone"
                        /*getFullPath: function (template) {
                         var defer = $q.defer();
                         if (main.mode === 'ModeIntegrated' || main.mode === 'ModeOnline') {
                         ws.emit('getWorkspacePath', "", function (data) {
                         var p = data.workspace + "/" + template;
                         var filename = p.replace(/^.*[\\\/]/, '');
                         path = p.replace(filename, '');
                         defer.resolve(path);
                         });
                         } else {
                         var filename = template.replace(/^.*[\\\/]/, '');
                         path = template.replace(filename, '');
                         defer.resolve(path);
                         }
                         return defer.promise;
                         }*/
                    };
                    return main;
                }]);

    }
);
