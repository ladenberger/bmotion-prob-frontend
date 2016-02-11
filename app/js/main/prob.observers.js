/**
 * BMotion Studio for ProB Observer Module
 *
 */
define(['bms.func', 'jquery', 'angular', 'qtip', 'prob.modal'], function(bms, $, angular) {

  return angular.module('prob.observers', ['prob.modal'])
    .service('bmsObserverService', ['$q', '$injector', 'trigger', 'bmsModalService', function($q, $injector, trigger, bmsModalService) {
      var bmsidCache = {};
      //var hasErrors = false;
      var observerService = {
        getBmsIds: function(visId, selector, container) {
          if (bmsidCache[visId] === undefined) {
            bmsidCache[visId] = {};
          }
          if (bmsidCache[visId][selector] === undefined) {
            var bmsids = container.find(selector).map(function() {
              var cbmsid = $(this).attr("data-bms-id");
              if (!cbmsid) {
                cbmsid = bms.uuid();
                $(this).attr("data-bms-id", cbmsid);
              }
              return cbmsid;
            });
            bmsidCache[visId][selector] = bmsids;
          }
          return bmsidCache[visId][selector];
        },
        clearBmsIdCache: function(visId) {
          if (bmsidCache[visId]) {
            bmsidCache[visId] = {};
          }
        },
        getBmsIdForElement: function(element) {
          var cbmsid = element.attr("data-bms-id");
          if (!cbmsid) {
            cbmsid = bms.uuid();
            element.attr("data-bms-id", cbmsid);
          }
          return cbmsid;
        },
        checkObserver: function(sessionId, visId, observer, container, stateId, cause, data) {
          return observerService.checkObservers(sessionId, visId, [observer], container, stateId, cause, data);
        },
        checkObservers: function(sessionId, visId, observers, container, stateId, cause, data) {

          var defer = $q.defer();

          var formulaObservers = [];
          var predicateObservers = [];
          var promises = [];
          var errors = [];

          if (!cause) cause = trigger.TRIGGER_ANIMATION_CHANGED;
          //observerService.hideErrors(container);

          angular.forEach(observers, function(o) {
            if (o.type === 'formula') {
              formulaObservers.push(o);
            } else if (o.type === 'predicate') {
              predicateObservers.push(o);
            } else {
              try {
                var observerInstance = $injector.get(o.type, "");
              } catch (err) {
                var err = "No observer with type '" + o.type + "' exists!";
                if (o.data.selector) err = err + " (Selector: " + o.data.selector + ")";
                errors.push(err);
              } finally {
                if (observerInstance) {
                  promises.push(observerInstance.check(sessionId, visId, o, container, stateId, cause, data));
                }
              }
            }
          });

          // Special case for formula observers
          if (!$.isEmptyObject(formulaObservers)) {
            // Execute formula observer at once (performance boost)
            var observerInstance = $injector.get("formula", "");
            promises.push(observerInstance.check(sessionId, visId, formulaObservers, container, stateId, cause, data));
          }

          // Special case for predicate observers
          if (!$.isEmptyObject(predicateObservers)) {
            // Execute predicate observer at once (performance boost)
            var observerInstance = $injector.get("predicate", "");
            promises.push(observerInstance.check(sessionId, visId, predicateObservers, container, stateId, cause, data));
          }

          if (errors.length > 0) {
            bmsModalService.setError(errors.join("<br/>"));
          }

          $q.all(promises)
            .then(function(res) {
              defer.resolve(res);
            });

          return defer.promise;

        },
        setupEvent: function(sessionId, visId, evt, container, traceId) {
          try {
            var instance = $injector.get(evt.type, "");
            instance.setup(sessionId, visId, evt, container, traceId);
          } catch (err) {
            bmsModalService.setError("No event with type '" + evt.type + "' exists! (Selector: " + evt.data.selector + ")");
          }
        },
        setupEvents: function(sessionId, visId, evts, container, traceId) {
          if (evts) {
            angular.forEach(evts, function(evt) {
              observerService.setupEvent(sessionId, visId, evt, container, traceId);
            });
          }
        }

      };
      return observerService;
    }])
    .service('csp-event', ['ws', '$q', 'bmsObserverService', function(ws, $q, bmsObserverService) {

      var expressionCache = {};

      var replaceParameter = function(str, para) {
        var fstr = str;
        angular.forEach(para, function(p, i) {
          var find = '{{a' + (i + 1) + '}}';
          var re = new RegExp(find, 'g');
          fstr = fstr.replace(re, p);
        });
        return fstr;
      };

      var getExpression = function(sessionId, visId, observer, stateId) {

        var defer = $q.defer();

        var formulas = [];
        angular.forEach(observer.data.observers, function(o) {
          if (o.exp) formulas.push({
            formula: o.exp
          });
        });

        var expressions = expressionCache[visId];
        if (!expressions) {
          ws.emit("evaluateFormulas", {
            data: {
              id: sessionId,
              formulas: formulas,
              stateId: stateId
            }
          }, function(data) {
            expressionCache[visId] = data;
            angular.forEach(data, function(e) {
              if (!e.error) {
                e.trans = e.result.replace("{", "").replace("}", "").split(",");
              }
            });
            defer.resolve(data);
          });
        } else {
          defer.resolve(expressions);
        }

        return defer.promise;

      };

      var cspEventObserver = {

        getDefaultOptions: function(options) {
          return bms.normalize($.extend({
            cause: "AnimationChanged",
            observers: []
          }, options), []);
        },
        apply: function(sessionId, visId, observer, container, options) {

          var defer = $q.defer();

          var stateId = options.stateId;

          ws.emit("observeHistory", {
            data: {
              id: sessionId,
              stateId: stateId
            }
          }, function(data) {

            getExpression(sessionId, visId, observer, stateId).then(function(expressions) {

              var fmap = {};

              var keepGoing = true;

              angular.forEach(data, function(t) {

                if (keepGoing) {

                  angular.forEach(observer.data.observers, function(o) {

                    var events = [];
                    if (o.exp) {
                      var eventsFromExp = expressions[o.exp].trans;
                      if (eventsFromExp) {
                        events = events.concat(eventsFromExp);
                      }
                    }
                    if (o.events) {
                      events = events.concat(o.events);
                    }

                    if ($.inArray(t['opString'], events) > -1) {
                      if (o.trigger) {
                        o.trigger.call(this, t);
                      }
                      angular.forEach(o.actions, function(a) {
                        var selector;
                        if (bms.isFunction(a.selector)) {
                          selector = a.selector.call(this, t);
                        } else {
                          selector = replaceParameter(a.selector, t['parameter']);
                        }
                        var attr = replaceParameter(a.attr, t['parameter']);
                        var value = replaceParameter(a.value, t['parameter']);

                        var bmsids = bmsObserverService.getBmsIds(visId, selector, container);
                        angular.forEach(bmsids, function(id) {
                          if (fmap[id] === undefined) {
                            fmap[id] = {};
                          }
                          fmap[id][attr] = value;
                        });
                      });
                    }

                  });

                }

                keepGoing = !t['current'];

              });

              defer.resolve(fmap);

            });

          });

          return defer.promise;

        },

        check: function(sessionId, visId, observer, container, stateId) {

          var defer = $q.defer();

          cspEventObserver.apply(sessionId, visId, observer, container, {
            stateId: stateId
          }).then(function(d) {
            defer.resolve(d);
          });

          return defer.promise;
        }

      };

      return cspEventObserver;

    }])
    .service('formula', ['ws', '$q', 'bmsObserverService', 'bmsModalService', 'bmsVisualizationService', function(ws, $q, bmsObserverService, bmsModalService, bmsVisualizationService) {

      var formulaObserver = {
        getDefaultOptions: function(options) {
          return $.extend({
            formulas: [],
            cause: "AnimationChanged",
            trigger: function() {}
          }, options);
        },
        getFormulas: function(observer) {
          return bms.toList(observer.data.formulas).map(function(f) {
            return {
              formula: f,
              translate: observer.data.translate
            }
          });
        },
        shouldBeChecked: function(visId, obj) {
          var visualization = bmsVisualizationService.getVisualization(visId);
          var check = true;
          if (obj.data.refinement !== undefined && !bms.inArray(obj.data.refinement, visualization["model"]["refinements"])) {
            check = false;
          }
          return check;
        },
        apply: function(sessionId, visId, observer, container, options) {

          var defer = $q.defer();

          var result = options.result;

          if (observer.data.trigger !== undefined) {

            var selector = observer.data.selector;
            var self = this;
            if (selector) {
              var fvalues = {};
              var element = container.find(observer.data.selector);
              element.each(function() {
                var ele = $(this);
                var returnValue;
                if (typeof observer.data.trigger === 'function') {
                  returnValue = observer.data.trigger.call(self, ele, result);
                } else {
                  // Whenever the function comes from json, we need to convert
                  // the string function to a real javascript function
                  // TODO: We need to handle errors while converting the string function to a reals javascript function
                  returnValue = new Function('origin', 'values', observer.data.trigger)(ele, result);
                }
                if (returnValue) {
                  var bmsid = bmsObserverService.getBmsIdForElement(ele);
                  fvalues[bmsid] = returnValue;
                }
              });
              defer.resolve(fvalues);
            } else {
              if (typeof observer.data.trigger === 'function') {
                observer.data.trigger.call(self, result);
              } else {
                new Function('values', observer.data.trigger)(result);
              }
              defer.resolve();
            }

          } else {
            defer.resolve();
          }

          return defer.promise;

        },
        check: function(sessionId, visId, observer, container, stateId, trigger) {

          var defer = $q.defer();

          var observers = Object.prototype.toString.call(observer) !== '[object Array]' ? [observer] : observer;

          // Collect formulas
          var formulas = [];
          angular.forEach(observers, function(o) {

            if (formulaObserver.shouldBeChecked(visId, o) && o.data.cause === trigger) {
              formulas = formulas.concat(bms.mapFilter(bms.toList(o.data.formulas), function(f) {
                return {
                  formula: f,
                  translate: o.data.translate ? o.data.translate : false
                };
              }));
            }

          });

          // Evaluate formulas and apply observers
          ws.emit("evaluateFormulas", {
            data: {
              id: sessionId,
              formulas: formulas,
              stateId: stateId
            }
          }, function(data) {

            var promises = [];
            var errors = [];
            angular.forEach(observers, function(o) {

              if (formulaObserver.shouldBeChecked(visId, o) && o.data.cause === trigger) {

                var result = [];
                angular.forEach(bms.toList(o.data.formulas), function(f) {
                  if (data[f]['error']) {
                    var err = data[f]['error'];
                    if (o.data.selector) err = err + " (formula observer, selector: " + o.data.selector + ", formula: " + f + ")";
                    errors.push(err);
                  } else {
                    result.push(data[f]['trans'] !== undefined ? data[f]['trans'] : data[f]['result']);
                  }
                });

                promises.push(formulaObserver.apply(sessionId, visId, o, container, {
                  result: result
                }));

              }

            });

            var fvalues = {};
            if (errors.length === 0) {
              $q.all(promises).then(function(data) {
                angular.forEach(data, function(value) {
                  if (value !== undefined) {
                    $.extend(true, fvalues, value);
                  }
                });
                defer.resolve(fvalues);
              });
            } else {
              bmsModalService.openErrorDialog(errors);
              defer.resolve(fvalues);
            }

          });

          return defer.promise;

        }
      };

      return formulaObserver;

    }])
    .service('bset', ['ws', '$q', 'bmsObserverService', 'bmsVisualizationService', function(ws, $q, bmsObserverService, bmsVisualizationService) {

      var bsetObserver = {

        getDefaultOptions: function(options) {
          return $.extend({
            expression: "",
            convert: function(id) {
              return "#" + id.value;
            },
            transform: {},
            cause: "AnimationChanged"
          }, options);
        },
        getFormulas: function(observer) {
          return [{
            formula: observer.data.expression,
            translate: true
          }];
        },
        shouldBeChecked: function(visId, obj) {
          var visualization = bmsVisualizationService.getVisualization(visId);
          var check = true;
          if (obj.data.refinement !== undefined && !bms.inArray(obj.data.refinement, visualization["model"]["refinements"])) {
            check = false;
          }
          return check;
        },
        apply: function(sessionId, visId, observer, container, options) {

          var defer = $q.defer();

          var values = options.result[0];

          if (values && values.length > 0) {

            var fvalues = {};

            if (observer.data.convert) {
              values = values.map(function(id) {
                return observer.data.convert(id);
              });
            }
            angular.forEach(values, function(sid) {
              var element = container.find(observer.data.selector);
              var bmsids = bmsObserverService.getBmsIds(visId, sid, element);
              angular.forEach(bmsids, function(id) {
                if (fvalues[id] === undefined) {
                  fvalues[id] = {};
                }
                for (attr in observer.data.transform) {
                  fvalues[id][attr] = observer.data.transform[attr];
                }
              });
              defer.resolve(fvalues);
            });
            /*var fsel = "#" + fset.join(",#");
             var element = container.find(observer.data.selector);
             var elements = element.find(fsel);
             observer.data.trigger(elements);*/
          }
          defer.resolve();

          return defer.promise;

        },
        check: function(sessionId, visId, observer, container, stateId, trigger) {

          var defer = $q.defer();

          if (observer.data.cause === trigger) {
            // Evaluate formulas and apply observers
            ws.emit("evaluateFormulas", {
              data: {
                id: sessionId,
                formulas: [{
                  formula: observer.data.expression,
                  translate: true
                }],
                stateId: stateId
              }
            }, function(data) {
              bsetObserver.apply(sessionId, visId, observer, container, {
                result: [data[observer.data.expression].trans]
              }).then(function(d) {
                defer.resolve(d);
              });
            });
          } else {
            defer.resolve();
          }

          return defer.promise;

        }

      };

      return bsetObserver;

    }])
    .service('nextEvents', ['ws', '$q', function(ws, $q) {

      var oservice = {
        apply: function(sessionId, visId, observer, container, data) {

          var defer = $q.defer();

          if (observer.data.trigger !== undefined) {

            var selector = observer.data.selector;
            var self = this;
            if (selector) {
              var fvalues = {};
              var element = container.find(observer.data.selector);
              element.each(function() {
                var ele = $(this);
                var returnValue;
                if (typeof observer.data.trigger === 'function') {
                  returnValue = observer.data.trigger.call(self, ele, data);
                } else {
                  // Whenever the function comes from json, we need to convert
                  // the string function to a real javascript function
                  // TODO: We need to handle errors while converting the string function to a reals javascript function
                  returnValue = new Function('origin', 'events', observer.data.trigger)(ele, data);
                }
                if (returnValue) {
                  var bmsid = bmsObserverService.getBmsIdForElement(ele);
                  fvalues[bmsid] = returnValue;
                }
              });
              defer.resolve(fvalues);
            } else {
              if (typeof observer.data.trigger === 'function') {
                observer.data.trigger.call(self, data);
              } else {
                new Function('events', observer.data.trigger)(data);
              }
              defer.resolve();
            }

          } else {
            defer.resolve();
          }

          return defer.promise;
        },
        check: function(sessionId, visId, observer, container, stateId, trigger) {
          var defer = $q.defer();
          ws.emit("observeNextEvents", {
            data: {
              id: sessionId,
              stateId: stateId
            }
          }, function(data) {
            /**
             * { data:
             *    {
             *      events: [
             *       { name: <event name>, parameter: <parameter as list> },
             *       ...
             *      ]
             *    }
             * }
             */
            defer.resolve(oservice.apply(sessionId, visId, observer, container, data));
            return defer.promise;
          });
        }
      };

      return oservice;

    }])
    .service('history', ['ws', '$q', function(ws, $q) {

      var historyObserver = {
        apply: function(sessionId, visId, observer, container, history) {

          var defer = $q.defer();

          if (observer.data.trigger !== undefined) {

            var selector = observer.data.selector;
            var self = this;
            if (selector) {
              var fvalues = {};
              var element = container.find(observer.data.selector);
              element.each(function() {
                var ele = $(this);
                var returnValue;
                if (typeof observer.data.trigger === 'function') {
                  returnValue = observer.data.trigger.call(self, ele, history);
                } else {
                  // Whenever the function comes from json, we need to convert
                  // the string function to a real javascript function
                  // TODO: We need to handle errors while converting the string function to a reals javascript function
                  returnValue = new Function('origin', 'history', observer.data.trigger)(ele, history);
                }
                if (returnValue) {
                  var bmsid = bmsObserverService.getBmsIdForElement(ele);
                  fvalues[bmsid] = returnValue;
                }
              });
              defer.resolve(fvalues);
            } else {
              if (typeof observer.data.trigger === 'function') {
                observer.data.trigger.call(self, history);
              } else {
                new Function('history', observer.data.trigger)(history);
              }
              defer.resolve();
            }

          } else {
            defer.resolve();
          }

          return defer.promise;
        },
        check: function(sessionId, visId, observer, container, stateId, trigger) {
          var defer = $q.defer();
          ws.emit("observeHistory", {
            data: {
              id: sessionId,
              stateId: stateId
            }
          }, function(data) {
            /**
             * { data:
             *    {
             *      events: [
             *       { name: <event name>, parameter: <parameter as list> },
             *       ...
             *      ]
             *    }
             * }
             */
            defer.resolve(historyObserver.apply(sessionId, visId, observer, container, data));
            return defer.promise;
          });
        }
      };

      return historyObserver;

    }])
    .service('refinement', ['ws', '$q', 'bmsVisualizationService', 'bmsObserverService', function(ws, $q, bmsVisualizationService, bmsObserverService) {

      var refinementObserver = {
        getDefaultOptions: function(options) {
          return $.extend({
            refinement: ""
          }, options);
        },
        apply: function(sessionId, visId, observer, container) {

          var defer = $q.defer();

          var obj = {};
          var vis = bmsVisualizationService.getVisualization(visId);
          var visRefinements = vis["model"]["refinements"];

          if (visRefinements) {

            var jcontainer = $(container);

            var el = container.find(observer.data.selector);
            el.each(function(i, v) {
              var rr;
              var e = $(v);
              var ref = bms.callOrReturn(observer.data["refinement"], e, jcontainer);
              //var observerRefinements = Object.prototype.toString.call(refs) !== '[object Array]' ? [refs] : refs;
              // TODO: Maybe an intersection of both arrays (visRefinements and observerRefinements) would be more efficient.
              if ($.inArray(ref, visRefinements) > -1) {
                rr = bms.callOrReturn(observer.data['enable'], e, jcontainer);
              } else {
                rr = bms.callOrReturn(observer.data['disable'], e, jcontainer);
              }
              if (rr) {
                var bmsid = bmsObserverService.getBmsIdForElement(e);
                obj[bmsid] = rr;
              }
            });

          }

          defer.resolve(obj);

          return defer.promise;

        },
        check: function(sessionId, visId, observer, container, stateId, trigger) {

          var defer = $q.defer();

          //TODO: Check refinement observer only once!

          defer.resolve(refinementObserver.apply(sessionId, visId, observer, container));

          return defer.promise;

        }
      };

      return refinementObserver;

    }])
    .service('predicate', ['ws', '$q', 'bmsObserverService', 'bmsVisualizationService', function(ws, $q, bmsObserverService, bmsVisualizationService) {

      var predicateObserver = {

        getDefaultOptions: function(options) {
          return $.extend({
            predicate: "",
            true: {},
            false: {},
            cause: "AnimationChanged"
          }, options);
        },
        getFormulas: function(observer) {
          return [{
            formula: observer.data.predicate,
            translate: false
          }];
        },
        shouldBeChecked: function(visId, obj) {
          var visualization = bmsVisualizationService.getVisualization(visId);
          var check = true;
          if (obj.data.refinement !== undefined && !bms.inArray(obj.data.refinement, visualization["model"]["refinements"])) {
            check = false;
          }
          return check;
        },
        apply: function(sessionId, visId, observer, container, options) {

          var defer = $q.defer();
          var selector = observer.data.selector;
          if (selector) {
            var fvalues = {};
            var result = options.result;
            var element = container.find(observer.data.selector);
            var jcontainer = $(container);
            element.each(function() {
              var ele = $(this);
              var returnValue;
              //var normalized = bms.normalize(observer.data, [], ele);
              if (result[0] === "TRUE") {
                returnValue = bms.callOrReturn(observer.data.true, ele, jcontainer);
              } else if (result[0] === "FALSE") {
                returnValue = bms.callOrReturn(observer.data.false, ele, jcontainer);
              }
              if (returnValue) {
                var bmsid = bmsObserverService.getBmsIdForElement(ele);
                fvalues[bmsid] = returnValue;
              }
            });
            defer.resolve(fvalues);
          } else {
            // TODO: We need a more meaningful error message
            bmsModalService.setError("Please specify a selector!");
            defer.resolve();
          }

          return defer.promise;

        },
        check: function(sessionId, visId, observer, container, stateId, trigger) {
          var defer = $q.defer();
          var promises = [];
          //var startWebsocket = new Date().getTime();
          var observers = Object.prototype.toString.call(observer) !== '[object Array]' ? [observer] : observer;
          // Collect formulas
          var formulas = [];
          angular.forEach(observers, function(o) {
            if (o.data.cause === trigger) {
              formulas.push({
                formula: o.data.predicate,
                translate: o.data.translate ? o.data.translate : false
              });
            }
          });
          ws.emit("evaluateFormulas", {
            data: {
              id: sessionId,
              formulas: formulas,
              stateId: stateId
            }
          }, function(data) {
            //var end = new Date().getTime();
            //var time = end - startWebsocket;
            //console.log('WEBSOCKET: ' + time);
            //var startPredicate = new Date().getTime();
            angular.forEach(observers, function(o) {
              if (o.data.cause === trigger) {
                var r = data[o.data.predicate];
                if (r) {
                  promises.push(predicateObserver.apply(sessionId, visId, o, container, {
                    result: [r.result]
                  }));
                }
              }
            });
            //var endPredicate = new Date().getTime();
            //var time = endPredicate - startPredicate;
            //console.log('PREDICATE OBSERVER: ' + time);
            var fvalues = {};
            $q.all(promises).then(function(data) {
              angular.forEach(data, function(value) {
                if (value !== undefined) {
                  $.extend(true, fvalues, value);
                }
              });
              defer.resolve(fvalues);
            });
          });
          return defer.promise;
        }
      };

      return predicateObserver;

    }])
    .service('executeEvent', ['ws', '$q', 'bmsModalService', 'bmsVisualizationService', function(ws, $q, bmsModalService, bmsVisualizationService) {

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

          ws.emit('checkEvents', {
            data: bms.normalize({
              id: sessionId,
              traceId: traceId,
              events: options.events
            }, [], element, container)
          }, function(data) {

            // Build tooltip content
            var tt_container = $('<div class="qtiplinks"></div>');
            var tt_ul = $('<ul style="display:table-cell;"></ul>');
            angular.forEach(data.events, function(evt) {

              var iconSpan = $('<span></span>')
                .css("margin-right", "2px")
                .addClass('glyphicon')
                .addClass(evt.canExecute ? 'glyphicon-ok-circle' : 'glyphicon-remove-circle');

              var labelSpan = $(bms.convertFunction('event,origin,container', options.label)(evt, element, container));
              if (evt.canExecute) {
                var callbackFunc = bms.convertFunction('data,origin,container', options.callback);
                labelSpan.click(function() {
                  ev.executeEvent({
                    id: sessionId,
                    traceId: traceId,
                    event: evt,
                    callback: callbackFunc
                  }, element, container, function() {
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
              viewport: $(window)
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

            if (options.selector) {

              var jcontainer = $(container);
              jcontainer.find(options.selector).each(function(i, ele) {

                var jele = $(ele);
                jele.css('cursor', 'pointer');
                var tooltip = ev.initTooltip(jele, jcontainer, options, sessionId, traceId);
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
                        callback: callbackFunc
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

            } else {
              // TODO: We need a more meaningful error message
              bmsModalService.setError("Please specify a selector!");
            }

          }

          defer.resolve();

          return defer.promise;

        }
      };

      return ev;

    }]);

});
