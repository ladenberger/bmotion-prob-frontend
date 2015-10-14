/**
 * BMotion Studio for ProB Observer Module
 *
 */
define(['bms.func', 'jquery', 'angular', 'qtip', 'prob.modal'], function (bms, $, angular) {

    return angular.module('prob.observers', ['bms.common', 'prob.modal'])
        .service('bmsObserverService', ['$q', '$injector', 'trigger', 'bmsModalService', function ($q, $injector, trigger, bmsModalService) {
            var bmsidCache = {};
            //var hasErrors = false;
            var observerService = {
                getBmsIds: function (visId, selector, container) {
                    if (bmsidCache[visId] === undefined) {
                        bmsidCache[visId] = {};
                    }
                    if (bmsidCache[visId][selector] === undefined) {
                        var bmsids = container.find(selector).map(function () {
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
                clearBmsIdCache: function (visId) {
                    if (bmsidCache[visId]) {
                        bmsidCache[visId] = {};
                    }
                },
                getBmsIdForElement: function (element) {
                    var cbmsid = element.attr("data-bms-id");
                    if (!cbmsid) {
                        cbmsid = bms.uuid();
                        element.attr("data-bms-id", cbmsid);
                    }
                    return cbmsid;
                },
                checkObserver: function (sessionId, visId, observer, container, stateId, cause, data) {
                    var defer = $q.defer();
                    var observerInstance;
                    if (!cause) cause = trigger.TRIGGER_ANIMATION_CHANGED;
                    try {
                        observerInstance = $injector.get(observer.type, '');
                    } catch (err) {
                        bmsModalService.setError("No observer with type '" + observer.type + "' exists! (Selector: " + observer.data.selector + ")");
                    } finally {
                        if (observerInstance) {
                            observerInstance.check(sessionId, visId, observer, container, stateId, cause, data).then(function (res) {
                                defer.resolve(res);
                            });
                        } else {
                            defer.resolve();
                        }
                    }
                    return defer.promise;
                },
                checkObservers: function (sessionId, visId, observers, container, stateId, cause, data) {

                    var defer = $q.defer();

                    var formulaObservers = [];
                    var predicateObservers = [];
                    var promises = [];
                    var errors = [];

                    if (!cause) cause = trigger.TRIGGER_ANIMATION_CHANGED;
                    //observerService.hideErrors(container);

                    angular.forEach(observers, function (o) {
                        if (o.type === 'formula') {
                            formulaObservers.push(o);
                        } else if (o.type === 'predicate') {
                            predicateObservers.push(o);
                        } else {
                            try {
                                var observerInstance = $injector.get(o.type, "");
                            } catch (err) {
                                errors.push("No observer with type '" + o.type + "' exists! (Selector: " + o.data.selector + ")");
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

                    $q.all(promises).then(function (res) {
                        defer.resolve(res);
                    });

                    return defer.promise;

                }
                /*,hideErrors: function (container) {
                 if (hasErrors) {
                 container.find('[data-hasqtip]').qtip('destroy');
                 }
                 hasErrors = false;
                 },
                 showError: function (element, type, error) {

                 if (!element.get(0)) element = $('body');
                 // TODO: check if element exists, if not attached qtip to root element (e.g. body)
                 if (!element.data('qtip-error')) {
                 element.qtip({ // Grab some elements to apply the tooltip to
                 content: {
                 text: '',
                 title: 'Observer errors'
                 },
                 position: {
                 my: 'top left',
                 at: 'center left',
                 effect: false,
                 viewport: $(window)
                 },
                 show: {
                 when: false,
                 ready: true
                 },
                 hide: {
                 event: false,
                 inactive: 10000
                 },
                 style: {
                 classes: 'qtip-rounded qtip-red'
                 }
                 });
                 element.data('qtip-error', true)
                 }
                 var api = element.qtip('api');
                 if (api) {
                 api.set('content.text', '<p><span style="font-weight:bold">' + type + '</span>: ' + error + '</p>' + api.get('content.text'));
                 }
                 hasErrors = true;
                 }*/
            };
            return observerService;
        }])
        .service('csp-event', ['ws', '$q', 'bmsObserverService', function (ws, $q, bmsObserverService) {

            var expressionCache = {};

            var replaceParameter = function (str, para) {
                var fstr = str;
                angular.forEach(para, function (p, i) {
                    var find = '{{a' + (i + 1) + '}}';
                    var re = new RegExp(find, 'g');
                    fstr = fstr.replace(re, p);
                });
                return fstr;
            };

            var getExpression = function (sessionId, visId, observer, stateId) {

                var defer = $q.defer();

                var formulas = [];
                angular.forEach(observer.data.observers, function (o) {
                    if (o.exp) formulas.push({formula: o.exp});
                });

                var expressions = expressionCache[visId];
                if (!expressions) {
                    ws.emit("evaluateFormulas", {
                        data: {
                            id: sessionId,
                            formulas: formulas,
                            stateId: stateId
                        }
                    }, function (data) {
                        expressionCache[visId] = data;
                        angular.forEach(data, function (e) {
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

                getDefaultOptions: function (options) {
                    return bms.normalize($.extend({
                        cause: "AnimationChanged",
                        observers: []
                    }, options), []);
                },
                apply: function (sessionId, visId, observer, container, options) {

                    var defer = $q.defer();

                    var stateId = options.stateId;

                    ws.emit("getHistory", {
                        data: {
                            id: sessionId,
                            stateId: stateId
                        }
                    }, function (data) {
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
                        getExpression(sessionId, visId, observer, stateId).then(function (expressions) {

                            var fmap = {};

                            angular.forEach(data.events, function (t) {

                                angular.forEach(observer.data.observers, function (o) {

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

                                    if ($.inArray(t.name, events) > -1) {
                                        if (o.trigger) {
                                            o.trigger.call(this, t);
                                        }
                                        angular.forEach(o.actions, function (a) {
                                            var selector;
                                            if (bms.isFunction(a.selector)) {
                                                selector = a.selector.call(this, t);
                                            } else {
                                                selector = replaceParameter(a.selector, t.parameter);
                                            }
                                            var attr = replaceParameter(a.attr, t.parameter);
                                            var value = replaceParameter(a.value, t.parameter);

                                            var bmsids = bmsObserverService.getBmsIds(visId, selector, container);
                                            angular.forEach(bmsids, function (id) {
                                                if (fmap[id] === undefined) {
                                                    fmap[id] = {};
                                                }
                                                fmap[id][attr] = value;
                                            });
                                        });
                                    }

                                });

                            });

                            defer.resolve(fmap);

                        });

                    });

                    return defer.promise;

                },

                check: function (sessionId, visId, observer, container, stateId) {

                    var defer = $q.defer();

                    cspEventObserver.apply(sessionId, visId, observer, container, {
                        stateId: stateId
                    }).then(function (d) {
                        defer.resolve(d);
                    });

                    return defer.promise;
                }

            };

            return cspEventObserver;

        }])
        .service('formula', ['ws', '$q', 'bmsObserverService', 'bmsModalService', function (ws, $q, bmsObserverService, bmsModalService) {

            var formulaObserver = {
                getDefaultOptions: function (options) {
                    return bms.normalize($.extend({
                        formulas: [],
                        cause: "AnimationChanged",
                        trigger: function () {
                        }
                    }, options), ["trigger"]);
                },
                getFormulas: function (observer) {
                    return observer.data.formulas.map(function (f) {
                        return {
                            formula: f,
                            translate: observer.data.translate
                        }
                    });
                },
                apply: function (sessionId, visId, observer, container, options) {

                    var defer = $q.defer();

                    var result = options.result;

                    var fvalues = {};

                    if (observer.data.trigger !== undefined) {

                        var selector = observer.data.selector;
                        var self = this;
                        if (selector) {
                            var element = container.find(observer.data.selector);
                            element.each(function () {
                                var ele = $(this);
                                if (typeof observer.data.trigger === 'function') {
                                    var returnValue = observer.data.trigger.call(self, ele, result);
                                    var bmsid = bmsObserverService.getBmsIdForElement(ele);
                                    if (returnValue) fvalues[bmsid] = returnValue;
                                } else {
                                    // Whenever the function comes from json, we need to convert
                                    // the string function to a real javascript function
                                    // TODO: We need to handle errors while converting the string function to a reals javascript function
                                    var func = new Function('origin', 'values', observer.data.trigger);
                                    func(ele, result)
                                }
                            });
                            defer.resolve(fvalues);
                        } else {
                            // TODO: We need a more meaningful error message
                            bmsModalService.setError("Please specify a selector!");
                            defer.resolve();
                        }

                    } else {
                        defer.resolve();
                    }
                    return defer.promise;
                },
                check: function (sessionId, visId, observer, container, stateId, trigger) {

                    var defer = $q.defer();

                    var observers = Object.prototype.toString.call(observer) !== '[object Array]' ? [observer] : observer;

                    // Collect formulas
                    var formulas = [];
                    angular.forEach(observers, function (o) {
                        if (o.data.cause === trigger) {
                            formulas = formulas.concat(bms.mapFilter(o.data.formulas, function (f) {
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
                    }, function (data) {

                        var promises = bms.mapFilter(observers, function (o) {
                            if (o.data.cause === trigger) {
                                return formulaObserver.apply(sessionId, visId, o, container, {
                                    result: bms.mapFilter(o.data.formulas, function (f) {
                                        if (data[f]) {
                                            return data[f].trans ? data[f].trans : data[f].result;
                                        }
                                    })
                                });
                            }
                        });

                        var fvalues = {};
                        $q.all(promises).then(function (data) {
                            angular.forEach(data, function (value) {
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

            return formulaObserver;

        }])
        .service('bset', ['ws', '$q', 'bmsObserverService', function (ws, $q, bmsObserverService) {

            var bsetObserver = {

                getDefaultOptions: function (options) {
                    return bms.normalize($.extend({
                        expression: "",
                        convert: function (id) {
                            return "#" + id.value;
                        },
                        transform: {},
                        cause: "AnimationChanged"
                    }, options), ["convert"]);
                },
                getFormulas: function (observer) {
                    return [{
                        formula: observer.data.expression,
                        translate: true
                    }];
                },
                apply: function (sessionId, visId, observer, container, options) {

                    var defer = $q.defer();

                    var values = options.result[0];

                    if (values.length > 0) {

                        var fvalues = {};

                        if (observer.data.convert) {
                            values = values.map(function (id) {
                                return observer.data.convert(id);
                            });
                        }
                        angular.forEach(values, function (sid) {
                            var element = container.find(observer.data.selector);
                            var bmsids = bmsObserverService.getBmsIds(visId, sid, element);
                            angular.forEach(bmsids, function (id) {
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
                check: function (sessionId, visId, observer, container, stateId, trigger) {

                    var defer = $q.defer();

                    if (observer.data.cause === trigger) {
                        // Evaluate formulas and apply observers
                        ws.emit("evaluateFormulas", {
                            data: {
                                id: sessionId,
                                formulas: [{formula: observer.data.expression, translate: true}],
                                stateId: stateId
                            }
                        }, function (data) {
                            bsetObserver.apply(sessionId, visId, observer, container, {
                                result: [data[observer.data.expression].trans]
                            }).then(function (d) {
                                defer.resolve(d);
                            });
                        });
                    }

                    return defer.promise;

                }

            };

            return bsetObserver;

        }])
        .service('refinement', ['ws', '$q', 'bmsVisualizationService', function (ws, $q, bmsVisualizationService) {

            return {
                check: function (observer, container, stateId, trigger, data) {

                    var defer = $q.defer();

                    //TODO: Check refinement observer only once!
                    var vis = bmsVisualizationService.getVisualization(data.visId);
                    var refinements = vis.refinements;

                    if (refinements) {
                        var obj = {};
                        var rr;

                        $.each(observer.data.refinements, function (i, v) {
                            if ($.inArray(v, refinements) > -1) {
                                rr = observer.data.enable;
                            } else {
                                rr = observer.data.disable;
                            }
                        });

                        if (rr) {
                            obj[observer.bmsid] = rr
                        }

                        defer.resolve(obj);
                    }

                    return defer.promise;

                }
            }

        }])
        .service('predicate', ['ws', '$q', function (ws, $q) {

            var observePredicateHelper = function (tf, element, observer) {
                if (Object.prototype.toString.call(tf) === '[object Object]') {
                    return tf;
                } else if (bms.isFunction(tf)) {
                    var el = observer.element ? $(observer.element) : element.find(observer.data.selector);
                    el.each(function (i, v) {
                        tf.call(this, $(v))
                    });
                    return null;
                }
            };

            var predicateObserver = {

                getDefaultOptions: function (options) {
                    return bms.normalize($.extend({
                        predicate: "",
                        cause: "AnimationChanged"
                    }, options), []);
                },
                getFormulas: function (observer) {
                    return [observer.data.predicate];
                },
                apply: function (observer, element, result) {
                    var defer = $q.defer();
                    var rr = {};
                    if (result[0] === "TRUE") {
                        rr = observePredicateHelper(observer.data.true, element, observer);
                    } else if (result[0] === "FALSE") {
                        rr = observePredicateHelper(observer.data.false, element, observer);
                    }
                    var obj = {};
                    if (rr) {
                        obj[observer.bmsid] = rr;
                    }
                    defer.resolve(obj);
                    return defer.promise;
                },
                check: function (id, observers, container, stateId, trigger) {
                    var defer = $q.defer();
                    var promises = [];
                    //var startWebsocket = new Date().getTime();

                    // Collect formulas
                    var formulas = [];
                    angular.forEach(observers, function (o) {
                        if (o.data.cause === trigger) {
                            formulas.push({
                                formula: o.data.predicate,
                                translate: o.data.translate ? o.data.translate : false
                            });
                        }
                    });

                    ws.emit("evaluateFormulas", {
                        data: {
                            id: id,
                            formulas: formulas,
                            stateId: stateId
                        }
                    }, function (data) {
                        //var end = new Date().getTime();
                        //var time = end - startWebsocket;
                        //console.log('WEBSOCKET: ' + time);
                        //var startPredicate = new Date().getTime();
                        angular.forEach(observers, function (o) {
                            if (o.data.cause === trigger) {
                                var r = data[o.data.predicate];
                                if (r) {
                                    promises.push(predicateObserver.apply(o, container, [r.result]));
                                }
                            }
                        });
                        //var endPredicate = new Date().getTime();
                        //var time = endPredicate - startPredicate;
                        //console.log('PREDICATE OBSERVER: ' + time);
                        var fvalues = {};
                        $q.all(promises).then(function (data) {
                            angular.forEach(data, function (value) {
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
        .service('executeEvent', ['ws', '$q', function (ws, $q) {

            var ev = {

                executeEvent: function (data, origin) {
                    var settings = bms.normalize($.extend({
                        events: [],
                        callback: function () {
                        }
                    }, data), ["callback"], origin);
                    ws.emit("executeEvent", {data: settings}, function (result) {
                        settings.callback.call(this, result)
                    });
                    return settings
                },
                getTooltipContent: function (options, origin, api) {
                    var defer = $q.defer();
                    var traceId = options.traceId;
                    ws.emit('initTooltip', {
                        data: bms.normalize(options, ["callback", "label"], origin)
                    }, function (data) {
                        var container = $('<div class="qtiplinks"></div>');
                        var ul = $('<ul style="display:table-cell;"></ul>');
                        angular.forEach(data.events, function (v) {
                            var iconSpan = $('<span aria-hidden="true"></span>');
                            var iconClass = 'glyphicon glyphicon-remove-circle';
                            if (v.canExecute) {
                                iconClass = 'glyphicon glyphicon-ok-circle cursor-pointer';
                            }
                            iconSpan.addClass(iconClass);
                            var labelSpan = $(options.label(v, origin));
                            if (v.canExecute) {
                                labelSpan.click(function () {
                                    ev.executeEvent({
                                        id: options.id,
                                        traceId: traceId,
                                        events: [v],
                                        callback: function () {
                                            api.set('content.text', function (event, api) {
                                                return ev.getTooltipContent(options, event.target, api)
                                                    .then(function (container) {
                                                        return container;
                                                    });
                                            });
                                        }
                                    })
                                });
                            }
                            ul.append($('<li></li>')
                                .addClass(v.canExecute ? 'enabled' : 'disabled')
                                .addClass('cursor-pointer')
                                .append(iconSpan)
                                .append(labelSpan));
                        });
                        container.append(ul);
                        defer.resolve(container);
                    });
                    return defer.promise;
                },
                setup: function (sessionId, visId, event, container, traceId) {
                    var defer = $q.defer();

                    var options = $.extend({
                        id: sessionId,
                        events: [],
                        tooltip: true,
                        traceId: traceId,
                        label: function (event) {
                            var predicateStr = event.predicate ? '(' + event.predicate + ')' : '';
                            return '<span aria-hidden="true"> ' + event.name + predicateStr + '</span>';
                        },
                        callback: function () {
                        }
                    }, event.data);

                    if (options.events.length > 0) {

                        var el = $(container).find(options.selector);
                        el.each(function (i2, v) {
                            var e = $(v);
                            e.css('cursor', 'pointer');
                            e.qtip({ // Grab some elements to apply the tooltip to
                                content: {
                                    text: function (event, api) {
                                        return ev.getTooltipContent(options, event.target, api)
                                            .then(function (container) {
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
                                show: 'click',
                                hide: {
                                    fixed: true,
                                    delay: 400
                                },
                                style: {
                                    classes: 'qtip-light qtip-bootstrap'
                                }
                            });
                        });

                    }

                    defer.resolve();

                    return defer.promise;
                }
            };

            return ev;

        }]);

});