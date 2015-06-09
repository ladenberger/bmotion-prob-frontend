/**
 * BMotion Studio Visualization Module
 *
 */
define(['angular'], function () {

        return angular.module('bms.visualization', [])
            .factory('bmsVisualisationService', [function () {
                var visualisations = {};
                return {
                    addVisualisation: function (name, data) {
                        visualisations[name] = data;
                    },
                    getVisualisations: function () {
                        return visualisations;
                    },
                    getVisualisation: function (name) {
                        return visualisations[name];
                    },
                    addSvg: function (name, id, svg) {
                        if (!visualisations[name]['svg']) visualisations[name]['svg'] = {};
                        visualisations[name]['svg'][id] = svg;
                    }
                }
            }]);

    }
);
