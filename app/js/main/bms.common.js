/**
 * BMotion Studio Common Module
 *
 */
define(['angular'], function (angular) {

        return angular.module('bms.common', [])
            .constant('trigger', {
                TRIGGER_MODEL_CHANGED: "ModelChanged",
                TRIGGER_MODEL_INITIALISED: "ModelInitialised",
                TRIGGER_MODEL_SETUP_CONSTANTS: "ModelSetupConstants",
                TRIGGER_ANIMATION_CHANGED: "AnimationChanged"
            })
            .factory('bmsMainService', [function () {
                var main = {
                    mode: "ModeStandalone"
                };
                return main;
            }]);

    }
);
