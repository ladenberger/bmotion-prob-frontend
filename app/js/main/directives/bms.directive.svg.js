/**
 * BMotion Studio for ProB Directive SVG module
 *
 */
define(['angular'], function(angular) {

  return angular.module('bms.directive.svg', ['prob.modal'])
    .directive('bmsSvg', ['$http', '$compile', 'bmsVisualizationService',
      function($http, $compile, bmsVisualizationService) {
        'use strict';
        return {
          restrict: 'A',
          replace: false,
          link: function($scope, element, attrs) {
            var svg = attrs['bmsSvg'];
            var vis = bmsVisualizationService.getVisualization($scope.id);
            var svgObj = bmsVisualizationService.addSvg($scope.id, svg);
            var reloadTemplate = function() {
              return $http.get(vis['templateFolder'] + '/' + svg)
                .success(function(svgCode) {
                  element.html(svgCode);
                  $compile(element.contents())($scope);
                  if (svgObj.defer) svgObj.defer.resolve();
                });
            };
            reloadTemplate();
          }
        }
      }
    ]);

});
