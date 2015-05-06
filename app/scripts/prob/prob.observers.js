/**
 * BMotion Studio for ProB Observer Module
 *
 */
define(['prob.api', 'angular', 'xeditable', 'qtip'], function (prob) {

    return angular.module('prob.observers', ['bms.common', 'prob.modal'])
        .service('bmsObserverService', ['$q', '$injector', function ($q, $injector) {
            var observers = {};
            var events = {};
            var bmsidCache = {};
            var observerService = {
                addObserver: function (name, o) {
                    if (observers[name] === undefined) {
                        observers[name] = [];
                    }
                    var no = $.extend({cause: "AnimationChanged"}, o);
                    observers[name].push(no);
                },
                addEvent: function (name, e) {
                    if (events[name] === undefined) {
                        events[name] = [];
                    }
                    events[name].push(e);
                },
                addObservers: function (name, obs) {
                    if (observers[name] === undefined) {
                        observers[name] = [];
                    }
                    if (obs) {
                        $.each(obs, function (i, v) {
                            observerService.addObserver(name, v)
                        });
                    }
                },
                addEvents: function (name, evts) {
                    if (events[name] === undefined) {
                        events[name] = [];
                    }
                    if (evts) {
                        $.each(evts, function (i, v) {
                            observerService.addEvent(name, v)
                        });
                    }
                },
                getObservers: function (name) {
                    return observers[name];
                },
                getBmsIds: function (selector, element) {
                    var bmsid = element.attr("data-bms-id");
                    if (!bmsid) {
                        bmsid = prob.uuid();
                        element.attr("data-bms-id", bmsid);
                    }
                    if (bmsidCache[bmsid] === undefined) {
                        bmsidCache[bmsid] = {};
                    }
                    if (bmsidCache[bmsid][selector] === undefined) {
                        var bmsids = $(element).find(selector).map(function () {
                            var cbmsid = $(this).attr("data-bms-id");
                            if (!cbmsid) {
                                cbmsid = prob.uuid();
                                $(this).attr("data-bms-id", cbmsid);
                            }
                            return cbmsid;
                        });
                        bmsidCache[bmsid][selector] = bmsids;
                    }
                    return bmsidCache[bmsid][selector];
                },
                checkObserver: function (observer, container, stateid, traceId, visId) {
                    var defer = $q.defer();
                    var observerInstance = $injector.get(observer.type, "");
                    if (observerInstance) {
                        observerInstance.check(observer, container, stateid, traceId, visId).then(function (data) {
                            defer.resolve(data);
                        });
                    }
                    return defer.promise;
                },
                checkObservers: function (observers, container, stateid, traceId, visId) {

                    var defer = $q.defer();

                    var formulaObservers = [];
                    var predicateObservers = [];
                    var promises = [];

                    angular.forEach(observers, function (o) {
                        if (o.type === 'formula') {
                            formulaObservers.push(o);
                        } else if (o.type === 'predicate') {
                            predicateObservers.push(o);
                        } else {
                            var observerInstance = $injector.get(o.type, "");
                            if (observerInstance) {
                                promises.push(observerInstance.check(o, container, stateid, traceId, visId));
                            }
                        }
                    });

                    // Special case for formula observers
                    if (!$.isEmptyObject(formulaObservers)) {
                        // Execute formula observer at once (performance boost)
                        var observerInstance = $injector.get("formula", "");
                        promises.push(observerInstance.check(formulaObservers, container, stateid, traceId, visId));
                    }

                    // Special case for predicate observers
                    if (!$.isEmptyObject(predicateObservers)) {
                        // Execute predicate observer at once (performance boost)
                        var observerInstance = $injector.get("predicate", "");
                        promises.push(observerInstance.check(predicateObservers, container, stateid, traceId, visId));
                    }

                    $q.all(promises).then(function (data) {
                        defer.resolve(data);
                    });

                    return defer.promise;

                }
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

            var getExpression = function (observer, stateId, traceId) {

                var defer = $q.defer();

                var formulas = [];
                angular.forEach(observer.data.observers, function (o) {
                    if (o.exp) formulas.push(o.exp);
                });

                var expressions = expressionCache[traceId];
                if (!expressions) {
                    ws.emit("evaluateFormulas", {
                        data: {
                            formulas: formulas,
                            stateId: stateId,
                            traceId: traceId
                        }
                    }, function (data) {
                        expressionCache[traceId] = data;
                        angular.forEach(data, function (e) {
                            e.trans = e.result.replace("{", "").replace("}", "").split(",");
                        });
                        defer.resolve(data);
                    });
                } else {
                    defer.resolve(expressions);
                }

                return defer.promise;

            };

            return {
                check: function (observer, container, stateId, traceId) {

                    var defer = $q.defer();

                    getExpression(observer, stateId, traceId).then(function (expressions) {

                        ws.emit("getHistory", {
                            data: {
                                traceId: traceId
                            }
                        }, function (data) {

                            var fmap = {};

                            angular.forEach(data.ops, function (t) {

                                angular.forEach(observer.data.observers, function (o) {

                                    var events = [];
                                    if (o.exp) {
                                        events = expressions[o.exp].trans;
                                    } else if (o.events) {
                                        events = o.events;
                                    }

                                    if ($.inArray(t.name, events) > -1) {
                                        if (o.trigger) {
                                            o.trigger.call(this, t);
                                        }
                                        angular.forEach(o.actions, function (a) {
                                            var selector;
                                            if (prob.isFunction(a.selector)) {
                                                selector = a.selector.call(this, t);
                                            } else {
                                                selector = replaceParameter(a.selector, t.parameter);
                                            }
                                            var attr = replaceParameter(a.attr, t.parameter);
                                            var value = replaceParameter(a.value, t.parameter);
                                            var bmsids = bmsObserverService.getBmsIds(selector, $(observer.element));
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
                }
            }
        }])
        .service('formula', ['ws', '$q', 'bmsObserverService', 'bmsModalService', function (ws, $q, bmsObserverService, bmsModalService) {

            var formulaObserver = {
                getFormulas: function (observer) {
                    return observer.data.formulas;
                },
                apply: function (observer, container, result) {
                    var defer = $q.defer();
                    if (observer.data.trigger !== undefined) {
                        var element = container.find("[data-bms-id=" + observer.bmsid + "]");
                        observer.data.trigger.call(this, $(element), result);
                        defer.resolve();
                    } else if (observer.data.getChanges !== undefined) {
                        var obj = {};
                        var rr = observer.data.getChanges.call(this, result);
                        if (rr) {
                            var bmsids = bmsObserverService.getBmsIds(observer.data.selector, container);
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
                check: function (observer, element, stateId, traceId) {

                    var defer = $q.defer();

                    var observers = Object.prototype.toString.call(observer) !== '[object Array]' ? [observer] : observer;

                    // Collect formulas
                    var formulas = [];
                    angular.forEach(observers, function (o) {
                        angular.forEach(o.data.formulas, function (f) {
                            formulas.push(f);
                            // TODO: handle translate property ...
                        });
                    });

                    // Evaluate formulas
                    ws.emit("evaluateFormulas", {
                        data: {
                            formulas: formulas,
                            stateId: stateId,
                            traceId: traceId
                        }
                    }, function (data) {

                        if (data.errors) {
                            bmsModalService.setError(data.errors);
                            defer.reject()
                        } else {
                            var promises = [];
                            angular.forEach(observers, function (o) {
                                var ff = [];
                                angular.forEach(o.data.formulas, function (f) {
                                    ff.push(data[f] ? data[f].result : null);
                                });
                                promises.push(formulaObserver.apply(o, element, ff));
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
                        }
                    });

                    return defer.promise;

                }
            };

            return formulaObserver;

        }])
        .service('refinement', ['ws', '$q', 'bmsVisualisationService', function (ws, $q, bmsVisualisationService) {

            return {
                check: function (observer, element, stateId, traceId, visId) {

                    var defer = $q.defer();

                    //TODO: Check refinement observer only once!
                    var vis = bmsVisualisationService.getVisualisation(visId);
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
        .service('predicate', ['ws', '$q', 'bmsObserverService', function (ws, $q, bmsObserverService) {

            var observePredicateHelper = function (tf, element, observer) {
                if (Object.prototype.toString.call(tf) === '[object Object]') {
                    return tf;
                } else if (prob.isFunction(tf)) {
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
                check: function (observers, element, stateid, traceid) {
                    var defer = $q.defer();
                    var promises = [];
                    //var startWebsocket = new Date().getTime();
                    ws.emit("evaluateFormulas", {
                        data: {
                            formulas: observers.map(function (o) {
                                return o.data.predicate;
                            }),
                            stateId: stateid,
                            traceId: traceid
                        }
                    }, function (data) {
                        //var end = new Date().getTime();
                        //var time = end - startWebsocket;
                        //console.log('WEBSOCKET: ' + time);
                        //var startPredicate = new Date().getTime();
                        angular.forEach(observers, function (o) {
                            var r = data[o.data.predicate];
                            if (r) {
                                promises.push(predicateObserver.apply(o, element, [r.result]));
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
                    var settings = prob.normalize($.extend({
                        events: [],
                        callback: function () {
                        }
                    }, data), ["callback"], origin);
                    ws.emit("executeEvent", {data: settings}, function (result) {
                        settings.callback.call(this, result)
                    });
                    return settings
                },
                getTooltipContent: function (data, origin, api) {
                    var defer = $q.defer();
                    var traceId = data.traceId;
                    ws.emit('initTooltip', {
                        data: prob.normalize(data, ["callback"], origin)
                    }, function (data) {
                        var container = $('<div class="qtiplinks"></div>');
                        var ul = $('<ul style="display:table-cell;"></ul>');
                        angular.forEach(data.events, function (v) {
                            var spanClass = v.canExecute ? 'glyphicon glyphicon-ok-circle' : 'glyphicon glyphicon-remove-circle';
                            var predicateStr = v.predicate ? '(' + v.predicate + ')' : '';
                            var link = $('<span aria-hidden="true"> ' + v.name + predicateStr + '</span>').addClass(spanClass);
                            if (v.canExecute) {
                                link = $('<a href="#"> ' + v.name + predicateStr + '</a>').addClass(spanClass).click(function () {
                                    ev.executeEvent({
                                        traceId: traceId,
                                        events: [v],
                                        callback: function () {
                                            api.hide();
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
                setup: function (event, element, traceId) {

                    var defer = $q.defer();

                    var settings = $.extend({
                        events: [],
                        tooltip: true,
                        traceId: traceId,
                        callback: function () {
                        }
                    }, event.data);

                    var el = event.element ? $(event.element) : $(element).find(settings.selector);
                    el.each(function (i2, v) {
                        var e = $(v);
                        e.click(function (event) {
                            $(e).qtip('hide');
                            ev.executeEvent(settings, $(event.target));
                        }).css('cursor', 'pointer');
                        if (settings.tooltip) {
                            e.qtip({ // Grab some elements to apply the tooltip to
                                content: {
                                    text: function (event, api) {
                                        return ev.getTooltipContent(settings, event.target, api).then(function (container) {
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
                                show: {
                                    delay: 600
                                },
                                hide: {
                                    fixed: true,
                                    delay: 300
                                },
                                style: {
                                    classes: 'qtip-light qtip-bootstrap'
                                }
                            });
                        }
                        defer.resolve();
                    });
                    return defer.promise;
                }
            };

            return ev;

        }]);

});