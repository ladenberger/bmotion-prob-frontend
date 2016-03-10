/**
 * BMotion Studio for ProB Execute Event Handler
 *
 */
define(['bms.func', 'jquery', 'angular', 'qtip', 'prob.modal'], function(bms, $, angular) {

  return angular.module('bms.handlers.event', ['prob.modal'])
    .factory('executeEvent', ['ws', '$q', 'bmsModalService', 'bmsVisualizationService',
      function(ws, $q, bmsModalService, bmsVisualizationService) {
        'use strict';
        var ev = {

          getDefaultOptions: function(options) {
            return $.extend({
              events: [],
              tooltip: true,
              label: function(event) {
                var predicateStr = event.predicate ? '(' + event.predicate + ')' : '';
                return '<span>' + event.name + predicateStr + '</span>';
              },
              callback: function() {}
            }, options);
          },
          executeEvent: function(data, origin, container, callback) {
            var settings = bms.normalize(data, ["callback"], origin, container);
            ws.emit("executeEvent", {
              data: settings
            }, function(result) {
              if (settings.callback) settings.callback.call(this, result, origin, container);
              callback.call(this);
            });
            return settings
          },
          shouldBeChecked: function(visId, obj) {
            var visualization = bmsVisualizationService.getVisualization(visId);
            return !(obj.data.refinement !== undefined && !bms.inArray(obj.data.refinement, visualization["model"]["refinements"]));
          },
          getTooltipContent: function(element, container, options, sessionId, traceId, api) {

            var defer = $q.defer();
            var jcontent = $(container).contents();

            ws.emit('checkEvents', {
              data: bms.normalize({
                id: sessionId,
                traceId: traceId,
                events: options.events
              }, [], element, jcontent)
            }, function(data) {

              // Build tooltip content
              var tt_container = $('<div class="qtiplinks" style="max-width:250px;"></div>');
              var tt_ul = $('<ul style="display:table-cell;"></ul>');
              angular.forEach(data.events, function(evt) {

                var iconSpan = $('<span></span>')
                  .css("margin-right", "2px")
                  .addClass('glyphicon')
                  .addClass(evt.canExecute ? 'glyphicon-ok-circle' : 'glyphicon-remove-circle');

                var labelSpan = $('<span>' + bms.convertFunction('event,origin,container', options.label)(evt, element, jcontent) + '</span>');
                if (evt.canExecute) {
                  var callbackFunc = bms.convertFunction('data,origin,container', options.callback);
                  labelSpan.click(function() {
                    ev.executeEvent({
                      id: sessionId,
                      traceId: traceId,
                      event: evt,
                      callback: callbackFunc,
                      executor: element.attr("id") ? element.attr("id") : 'unknown'
                    }, element, jcontent, function() {
                      api.hide();
                    })
                  });
                }

                tt_ul.append($('<li></li>')
                  .addClass(evt.canExecute ? 'enabled' : 'disabled')
                  .addClass(evt.canExecute ? 'cursor-pointer' : 'cursor-default')
                  .append(iconSpan)
                  .append(labelSpan));

              });

              tt_container.append(tt_ul);

              defer.resolve(tt_container);

            });

            return defer.promise;

          },
          initTooltip: function(element, container, options, sessionId, traceId) {

            var jcontainer = $(container);

            return element.qtip({
              content: {
                text: function(event, api) {
                  return ev.getTooltipContent(element, container, options, sessionId, traceId, api)
                    .then(function(container) {
                      return container;
                    });
                }
              },
              position: {
                my: 'bottom left',
                at: 'top right',
                effect: false,
                viewport: jcontainer,
                adjust: {
                  x: jcontainer.offset().left,
                  y: jcontainer.offset().top
                }
              },
              events: {
                show: function(event, api) {
                  var qtipDisable = element.data('qtip-disable') ? element.data('qtip-disable') : false;
                  if (event['originalEvent']['type'] === "mouseover" && qtipDisable) {
                    event.preventDefault();
                  }
                }
              },
              show: {
                delay: 1200,
                event: 'mouseover'
              },
              hide: {
                fixed: true,
                delay: 400
              },
              style: {
                classes: 'qtip-light qtip-bootstrap'
              }
            });

          },
          setup: function(sessionId, visId, event, container, traceId) {

            var defer = $q.defer();

            if (ev.shouldBeChecked(visId, event)) {

              var options = ev.getDefaultOptions(event.data);
              if (options.name) {
                options.events.push({
                  name: options.name,
                  predicate: options.predicate
                });
              }

              if (!options.selector && !options.element) {
                bmsModalService.openErrorDialog("Please specify a selector or an element.")
              } else {

                var jcontainer = $(container.contents());
                var jelements = options.element ? $(options.element) : jcontainer.find(options.selector);
                jelements.each(function(i, ele) {

                  var jele = $(ele);
                  jele.css('cursor', 'pointer');
                  var tooltip = ev.initTooltip(jele, container, options, sessionId, traceId);
                  var api = tooltip.qtip('api');
                  var callbackFunc = bms.convertFunction('data,origin,container', options.callback);

                  jele.click(function(event) {

                    ws.emit('checkEvents', {
                      data: bms.normalize({
                        id: sessionId,
                        traceId: traceId,
                        events: options.events
                      }, [], jele, jcontainer)
                    }, function(data) {

                      var enabledEvents = [];

                      angular.forEach(data['events'], function(event) {
                        if (event['canExecute']) enabledEvents.push(event);
                      });

                      if (enabledEvents.length === 1) {
                        // If only one events is enabled of the list of events, execute it
                        ev.executeEvent({
                          id: sessionId,
                          traceId: traceId,
                          event: enabledEvents[0],
                          callback: callbackFunc,
                          executor: jele.attr("id") ? jele.attr("id") : 'unknown'
                        }, jele, jcontainer, function() {
                          api.hide();
                        });
                      } else {
                        // Else show a popup displaying the available events
                        api.show('click');
                      }

                      jele.data('qtip-disable', true);

                    });

                  }).mouseout(function() {
                    jele.data('qtip-disable', false);
                  });

                });

              }

            }

            defer.resolve();

            return defer.promise;

          }
        };

        return ev;

      }
    ]);

});
