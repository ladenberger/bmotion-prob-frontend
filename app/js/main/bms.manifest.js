/**
 * BMotion Studio Manifest Module
 *
 */
define(['tv4', 'prob.common'], function (tv4) {

        return angular.module('bms.manifest', ['prob.common'])
            .factory('bmsManifestService', ['$q', '$http', 'manifestConstants', function ($q, $http, manifestConstants) {
                return {
                    validate: function (manifestFilePath) {

                        var defer = $q.defer();

                        var filename = manifestFilePath.replace(/^.*[\\\/]/, '');
                        if (filename === 'bmotion.json') {
                            $http.get(manifestFilePath).success(function (configData) {
                                if (tv4.validate(configData, manifestConstants.MANIFEST_SCHEME)) {
                                    defer.resolve(configData);
                                } else {
                                    defer.reject("BMotion manifest file (bmotion.json) invalid: " + tv4.error.message + " (" + tv4.error.dataPath + ")");
                                }
                            }).error(function (data, status, headers, config) {
                                if (status === 404) {
                                    defer.reject("File not found: " + config.url);
                                } else {
                                    defer.reject("Some error occurred while requesting file " + config.url);
                                }
                            });
                        } else {
                            defer.reject('Invalid file, please open a bmotion.json file!');
                        }

                        return defer.promise;

                    }

                }

            }]);

    }
);
