/**
 * BMotion Studio for ProB Common Module
 *
 */
define(['bms.socket'], function () {
        return angular.module('prob.common', ['bms.socket'])
            .constant('trigger', {
                TRIGGER_MODEL_CHANGED: "ModelChanged",
                TRIGGER_MODEL_INITIALISED: "ModelInitialised",
                TRIGGER_MODEL_SETUP_CONSTANTS: "ModelSetupConstants",
                TRIGGER_ANIMATION_CHANGED: "AnimationChanged"
            })
            .constant('manifestConstants', {
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
                    "required": ["model"]
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
