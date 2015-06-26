/**
 * BMotion Studio Visualization Module
 *
 */
define(['angular'], function () {

        return angular.module('bms.visualization', [])
            .factory('bmsVisualizationService', [function () {
                var currentVisualization,
                    visualizations = {};
                return {
                    addVisualization: function (id, data) {
                        visualizations[id] = data;
                    },
                    getVisualizations: function () {
                        return visualizations;
                    },
                    getVisualization: function (id) {
                        return visualizations[id];
                    },
                    setCurrentVisualizationId: function (id) {
                        currentVisualization = id;
                    },
                    getCurrentVisualizationId: function () {
                        return currentVisualization;
                    },
                    getCurrentVisualization: function () {
                        return visualizations[currentVisualization];
                    },
                    addSvg: function (id, svg) {
                        if (!visualizations[id]['svg']) visualizations[id]['svg'] = [];
                        if (visualizations[id]['svg'].indexOf(svg) === -1) visualizations[id]['svg'].push(svg);
                    }
                }
            }]);

    }
);
