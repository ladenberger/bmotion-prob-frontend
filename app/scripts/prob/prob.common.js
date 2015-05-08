/**
 * BMotion Studio for ProB Common Module
 *
 */
define(['angular-route', 'bms.common'], function () {
        return angular.module('prob.common', ['ngRoute', 'bms.common'])
            .constant('trigger', {
                TRIGGER_MODEL_CHANGED: "ModelChanged",
                TRIGGER_MODEL_INITIALISED: "ModelInitialised",
                TRIGGER_MODEL_SETUP_CONSTANTS: "ModelSetupConstants",
                TRIGGER_ANIMATION_CHANGED: "AnimationChanged"
            })
            .constant('manifest', {
                MANIFEST_SCHEME: {
                    "title": "BMotion Studio Manifest",
                    "type": "object",
                    "properties": {
                        "template": {
                            "type": "string",
                            "description": "Template HTML file"
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
                        "socket": {
                            "type": "object",
                            "properties": {
                                "host": {
                                    "type": "string",
                                    "description": "Host name of websocket server."
                                },
                                "port": {
                                    "type": "string",
                                    "description": "Port of websocket server."
                                }
                            }
                        }
                    },
                    "required": ["template", "model", "tool"]
                }
            })
            .factory('probMainService', ['$q', 'ws', function ($q, ws) {
                var port = null;
                var main = {
                    getPort: function () {
                        var defer = $q.defer();
                        if (port) {
                            defer.resolve(port);
                        } else {
                            ws.emit('initProB', "", function (port) {
                                port = port;
                                defer.resolve(port);
                            });
                        }
                        return defer.promise;
                    }
                };
                return main;
            }]);
    }
);
