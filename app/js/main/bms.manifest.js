/**
 * BMotion Studio Manifest Module
 *
 */
define(['tv4', 'angular'], function (tv4, angular) {

        return angular.module('bms.manifest', [])
            .factory('bmsManifestService', ['$q', '$http', function ($q, $http) {

                var factory = {
                    MANIFEST_SCHEME: {
                        "title": "BMotion Studio Manifest",
                        "type": "object",
                        "properties": {
                            "template": {
                                "type": "string",
                                "description": "Template Root HTML file"
                            },
                            "views": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "id": {
                                            "type": "string"
                                        },
                                        "template": {
                                            "type": "string"
                                        },
                                        "observers": {
                                            "type": "string"
                                        },
                                        "events": {
                                            "type": "string"
                                        },
                                        "width": {
                                            "type": "integer"
                                        },
                                        "height": {
                                            "type": "integer"
                                        },
                                        "autoOpen": {
                                            "type": "array",
                                            "description": "Specify the ProB views which should be opened automatically when starting the visualization. The following views are available: CurrentTrace, Events, StateInspector, CurrentAnimations, GroovyConsoleSession, ModelCheckingUI.",
                                            "items": {
                                                "type": "string"
                                            }
                                        }
                                    },
                                    "required": ["id", "template"]
                                }
                            },
                            "prob": {
                                "type": "object",
                                "properties": {
                                    "preferences": {
                                        "type": "object"
                                    }
                                }
                            },
                            "model": {
                                "type": "string",
                                "description": "Path to model (e.g. Event-B machine, CSP model)"
                            },
                            "tool": {
                                "type": "string",
                                "options": ["BAnimation", "CSPAnimation"],
                                "description": "Tool implementation (BAnimation or CSPAnimation)"
                            },
                            "autoOpen": {
                                "type": "array",
                                "description": "Specify the ProB views which should be opened automatically when starting the visualization. The following views are available: CurrentTrace, Events, StateInspector, CurrentAnimations, GroovyConsoleSession, ModelCheckingUI."
                            }
                        },
                        "required": []
                    },
                    validate: function (manifestFilePath) {
                        var defer = $q.defer();
                        //var filename = manifestFilePath.replace(/^.*[\\\/]/, '');
                        //if (filename === 'bmotion.json') {
                        $http.get(manifestFilePath).success(function (configData) {
                            if (tv4.validate(configData, factory.MANIFEST_SCHEME)) {
                                defer.resolve(configData);
                            } else {
                                defer.reject("BMotion Studio manifest file invalid: " + tv4.error.message + " (" + tv4.error.dataPath + ")");
                            }
                        }).error(function (data, status, headers, config) {
                            if (status === 404) {
                                defer.reject("File not found: " + config.url);
                            } else {
                                defer.reject("Some error occurred while requesting file " + config.url);
                            }
                        });
                        //} else {
                        //    defer.reject('Invalid file, please open a bmotion.json file!');
                        //}
                        return defer.promise;
                    }
                };

                return factory;

            }]);

    }
);
