/**
 * BMotion Studio for ProB Observer Module
 *
 */
define(['bms.func', 'angular', 'qtip'], function (bms) {

    return angular.module('prob.observers', ['bms.common'])
        .service('bmsObserverService', ['$q', '$injector', 'trigger', function ($q, $injector, trigger) {
            var observers = {};
            var events = {};
            var bmsidCache = {};
            //var hasErrors = false;
            var observerService = {
                addObserver: function (visId, o) {
                    if (observers[visId] === undefined) {
                        observers[visId] = [];
                    }
                    var no = $.extend({cause: "AnimationChanged"}, o);
                    observers[visId].push(no);
                },
                addEvent: function (visId, e) {
                    if (events[visId] === undefined) {
                        events[visId] = [];
                    }
                    events[visId].push(e);
                },
                addObservers: function (visId, obs) {
                    if (observers[visId] === undefined) {
                        observers[visId] = [];
                    }
                    if (obs) {
                        $.each(obs, function (i, v) {
                            observerService.addObserver(visId, v)
                        });
                    }
                },
                addEvents: function (visId, evts) {
                    if (events[visId] === undefined) {
                        events[visId] = [];
                    }
                    if (evts) {
                        $.each(evts, function (i, v) {
                            observerService.addEvent(visId, v)
                        });
                    }
                },
                getObservers: function (visId) {
                    return observers[visId];
                },
                getEvents: function (visId) {
                    return events[visId];
                },
                getBmsIds: function (visId, selector, container) {
                    /*var bmsid = element.attr("data-bms-id");
                     if (!bmsid) {
                     bmsid = bms.uuid();
                     element.attr("data-bms-id", bmsid);
                     }*/
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
                checkObserver: function (sessionId, visId, observer, container, stateId, cause, data) {
                    var defer = $q.defer();
                    var observerInstance = $injector.get(observer.type, '');
                    if (observerInstance) {
                        if (!cause) cause = trigger.TRIGGER_ANIMATION_CHANGED;
                        observerInstance.check(sessionId, visId, observer, container, stateId, cause, data).then(function (res) {
                            defer.resolve(res);
                        });
                    }
                    return defer.promise;
                },
                checkObservers: function (sessionId, visId, observers, container, stateId, cause, data) {

                    var defer = $q.defer();

                    var formulaObservers = [];
                    var predicateObservers = [];
                    var promises = [];

                    if (!cause) cause = trigger.TRIGGER_ANIMATION_CHANGED;
                    //observerService.hideErrors(container);

                    angular.forEach(observers, function (o) {
                        if (o.type === 'formula') {
                            formulaObservers.push(o);
                        } else if (o.type === 'predicate') {
                            predicateObservers.push(o);
                        } else {
                            var observerInstance = $injector.get(o.type, "");
                            if (observerInstance) {
                                promises.push(observerInstance.check(sessionId, visId, o, container, stateId, cause, data));
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
        .service('csp-event', ['ws', '$q', 'bmsObserverService', 'bmsVisualizationService', function (ws, $q, bmsObserverService, bmsVisualizationService) {

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
        .service('formula', ['ws', '$q', 'bmsObserverService', function (ws, $q, bmsObserverService) {

            var formulaObserver = {
                getFormulas: function (observer) {
                    return observer.data.formulas;
                },
                apply: function (sessionId, visId, observer, container, options) {

                    var defer = $q.defer();

                    var result = options.result;

                    if (observer.data.trigger !== undefined) {
                        var element = container.find(observer.data.selector);
                        var self = this;
                        //var element = container.find("[data-bms-id=" + observer.bmsid + "]");
                        element.each(function () {
                            observer.data.trigger.call(self, $(this), result);
                        });
                        defer.resolve();
                    } else if (observer.data.getChanges !== undefined) {
                        var obj = {};
                        var rr = observer.data.getChanges.call(this, result);
                        if (rr) {
                            var bmsids = bmsObserverService.getBmsIds(visId, observer.data.selector, container);
                            angular.forEach(bmsids, function (id) {
                                obj[id] = rr;
                            });
                        }
                        defer.resolve(obj);
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
                            angular.forEach(o.data.formulas, function (f) {
                                formulas.push({
                                    formula: f,
                                    translate: o.data.translate ? o.data.translate : false
                                });
                            });
                        }
                    });

                    // Evaluate formulas
                    ws.emit("evaluateFormulas", {
                        data: {
                            id: sessionId,
                            formulas: formulas,
                            stateId: stateId
                        }
                    }, function (data) {
                        var promises = [];
                        angular.forEach(observers, function (o) {
                            if (o.data.cause === trigger) {
                                var ff = [];
                                angular.forEach(o.data.formulas, function (f) {
                                    if (data[f]) {
                                        ff.push(data[f].trans ? data[f].trans : data[f].result);
                                    }
                                });
                                promises.push(formulaObserver.apply(sessionId, visId, o, container, {
                                    result: ff
                                }));
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
                            var spanClass = 'glyphicon glyphicon-remove-circle';
                            var label = options.label(v, origin);
                            var labelElement = label;
                            if (v.canExecute) {
                                spanClass = 'glyphicon glyphicon-ok-circle cursor-pointer';
                                labelElement = label;
                            }
                            var link = $(labelElement).addClass(spanClass);
                            if (v.canExecute) {
                                link.click(function () {
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
                            ul.append($('<li></li>').addClass(v.canExecute ? 'enabled' : 'disabled').append(link));
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